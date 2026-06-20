import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { ICustomerDB } from '@/database/models/customer';
import PaymentModel, { IPaymentDB, PaymentMethod, PaymentStatus, PaymentType, isOnlinePaymentMethod } from '@/database/models/payment';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';
import InspectionModel from '@/database/models/inspection';
import BrandOfferModel from '@/database/models/brandOffer';
import BrandModel from '@/database/models/brand';
import DeviceModel from '@/database/models/device';
import CategoryModel from '@/database/models/category';
import BrandWalletTransactionModel, {
    WalletTransactionDirection,
    WalletTransactionType,
} from '@/database/models/brandWalletTransaction';
import { PaymentResult } from './interfaces';
import PaymentServices from '../utils/payment/index';

// ---------------------------------------------------------------------------
// Helper: calculate commission, credit wallet, and create audit transaction
// ---------------------------------------------------------------------------
async function _processPaymentCommissionAndWallet(
    payment: IPaymentDB,
    categoryId: string,
    method: PaymentMethod,
    amount: number,
    brandId: string,
    repairRequestId: string,
): Promise<void> {
    // 1. Look up commission percentage from the category
    const category = await CategoryModel.findById(categoryId);
    const commissionPercent = category?.commissionPerRequest ?? 0;

    // 2. Determine online vs cash/POS
    const isOnline = isOnlinePaymentMethod(method);
    const commissionAmount = (amount * commissionPercent) / 100;
    // Net earnings are the same regardless of channel: gross minus platform commission.
    const brandNet = amount - commissionAmount;

    // Online: platform holds the funds, so it credits the brand's net share.
    // Cash/POS: the brand already collected the full amount in person, so the
    // platform only debits its commission from the wallet instead of crediting the gross amount.
    const direction = isOnline ? WalletTransactionDirection.CREDIT : WalletTransactionDirection.DEBIT;
    const walletDelta = isOnline ? brandNet : -commissionAmount;
    const transactionAmount = isOnline ? brandNet : commissionAmount;

    // 3. Update payment with commission data
    payment.categoryId = categoryId as any;
    payment.commissionAmount = commissionAmount;
    payment.brandNet = brandNet;
    await payment.save();

    // 4. Update brand wallet
    const brand = await BrandModel.findByIdAndUpdate(
        brandId,
        { $inc: { walletBalance: walletDelta } },
        { new: true },
    );

    // 5. Create audit trail
    await BrandWalletTransactionModel.create({
        brandId,
        type: isOnline
            ? WalletTransactionType.BOOKING_ONLINE
            : WalletTransactionType.BOOKING_CASH_POS,
        direction,
        amount: transactionAmount,
        balanceAfter: brand?.walletBalance ?? 0,
        paymentId: payment._id,
        repairRequestId,
        note: `Booking #${repairRequestId} ${isOnline ? 'online' : 'cash/POS'} payment`,
    });
}

// ---------------------------------------------------------------------------
// Customer: pay inspection fee (after selecting an offer)
// ---------------------------------------------------------------------------
export async function payInspectionFee(
    customer: ICustomerDB | null,
    requestId: string,
    method: PaymentMethod,
): AsyncSafeResult<{ payment: PaymentResult; paymentUrl: string | null }> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId });
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.OFFER_SELECTED) throw ApiError.invalidRepairRequestStatus();

        if (customer && customer._id!.toString() !== req.customerId.toString()) throw ApiError.unauthorized();

        const offer = await BrandOfferModel.findById(req.selectedOfferId);
        if (!offer) throw ApiError.notFoundBrandOffer();

        // Get device to resolve categoryId
        const device = await DeviceModel.findById(req.deviceId);
        if (!device) throw ApiError.notFoundDevice();

        const payment = await PaymentModel.create({
            repairRequestId: requestId,
            customerId: req.customerId,
            brandId: offer.brandId,
            categoryId: device.categoryId,
            type: PaymentType.INSPECTION,
            method: method,
            amount: offer.inspectionPrice,
            commissionAmount: 0,
            brandNet: 0,
            status: method === PaymentMethod.ONLINE ? PaymentStatus.PENDING : PaymentStatus.PAID,
            paidAt: method === PaymentMethod.ONLINE ? undefined : new Date(),
        });

        if (method !== PaymentMethod.ONLINE) {
            // Process commission and credit the brand wallet
            await _processPaymentCommissionAndWallet(
                payment,
                payment.categoryId.toString(),
                payment.method,
                payment.amount,
                payment.brandId.toString(),
                payment.repairRequestId.toString(),
            );

            // Advance request status to inspection pending
            req.status = RepairRequestStatus.INSPECTION_PENDING;
            await req.save();
        }

        let paymentUrl = null;
        if (method === PaymentMethod.ONLINE) {
            paymentUrl = await PaymentServices.createPaymentLink(
                customer!,
                payment._id.toString(),
                payment.amount,
            );
        }


        return { result: { payment: _formatPayment(payment), paymentUrl }, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: pay final repair price (after inspection result)
// ---------------------------------------------------------------------------
export async function payFinalPrice(
    customer: ICustomerDB | null,
    requestId: string,
    method: PaymentMethod,
): AsyncSafeResult<{ payment: PaymentResult; paymentUrl: string | null }> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId });
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.PAYMENT_PENDING) throw ApiError.invalidRepairRequestStatus();

        if (customer && customer._id!.toString() !== req.customerId.toString()) throw ApiError.unauthorized();

        const inspection = await InspectionModel.findOne({ repairRequestId: requestId });
        if (!inspection) throw ApiError.notFoundInspection();

        // Get device to resolve categoryId
        const device = await DeviceModel.findById(req.deviceId);
        if (!device) throw ApiError.notFoundDevice();

        const payment = await PaymentModel.create({
            repairRequestId: requestId,
            customerId: req.customerId,
            brandId: inspection.brandId,
            categoryId: device.categoryId,
            type: PaymentType.FINAL,
            method: method,
            amount: inspection.finalPrice,
            commissionAmount: 0,
            brandNet: 0,
            status: method === PaymentMethod.ONLINE ? PaymentStatus.PENDING : PaymentStatus.PAID,
            paidAt: method === PaymentMethod.ONLINE ? undefined : new Date(),
        });

        if (method !== PaymentMethod.ONLINE) {
            // Process commission and credit the brand wallet
            await _processPaymentCommissionAndWallet(
                payment,
                payment.categoryId.toString(),
                payment.method,
                payment.amount,
                payment.brandId.toString(),
                payment.repairRequestId.toString(),
            );

            req.status = RepairRequestStatus.PAYMENT_DONE;
            await req.save();

            // Mark request as completed
            req.status = RepairRequestStatus.PENDING_PROVIDER_REPAIR;
            await req.save();

            // Increment completedRepairs on the brand
            await BrandModel.findByIdAndUpdate(inspection.brandId, {
                $inc: { completedRepairs: 1 }
            });
        }

        let paymentUrl = null;
        if (method === PaymentMethod.ONLINE) {
            paymentUrl = await PaymentServices.createPaymentLink(
                customer!,
                payment._id.toString(),
                payment.amount,
            );
        }

        return { result: { payment: _formatPayment(payment), paymentUrl }, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get all payments for a repair request
// ---------------------------------------------------------------------------
export async function getPaymentsForRequest(
    customer: ICustomerDB,
    requestId: string,
): AsyncSafeResult<PaymentResult[]> {
    try {
        const payments = await PaymentModel.find({
            repairRequestId: requestId,
            customerId: customer._id,
        }).sort('createdAt');

        return { result: payments.map(_formatPayment), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: get all payments
// ---------------------------------------------------------------------------
export async function adminGetAllPayments(): AsyncSafeResult<PaymentResult[]> {
    try {
        const payments = await PaymentModel.find().sort('-createdAt');
        return { result: payments.map(_formatPayment), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export async function updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
): AsyncSafeResult<void> {
    try {
        const payment = await PaymentModel.findById(paymentId);
        if (!payment) throw ApiError.notFoundPayment();

        payment.status = status;
        if (status === PaymentStatus.PAID) {
            payment.paidAt = new Date();
        }
        await payment.save();


        if (status === PaymentStatus.PAID) {
            const req = await RepairRequestModel.findOne({ _id: payment.repairRequestId });
            if (!req) throw ApiError.notFoundRepairRequest();

            // Process commission and credit the brand wallet
            await _processPaymentCommissionAndWallet(
                payment,
                payment.categoryId.toString(),
                payment.method,
                payment.amount,
                payment.brandId.toString(),
                payment.repairRequestId.toString(),
            );


            if (payment.type === PaymentType.INSPECTION) {
                req.status = RepairRequestStatus.INSPECTION_PENDING;
                await req.save();
            }
            else {
                req.status = RepairRequestStatus.PAYMENT_DONE;
                await req.save();

                req.status = RepairRequestStatus.PENDING_PROVIDER_REPAIR;
                await req.save();

                await BrandModel.findByIdAndUpdate(payment.brandId, {
                    $inc: { completedRepairs: 1 }
                });
            }
        }

        return { result: null, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------
export function _formatPayment(doc: IPaymentDB): PaymentResult {
    return {
        id: doc._id!.toString(),
        repairRequestId: doc.repairRequestId.toString(),
        customerId: doc.customerId.toString(),
        brandId: doc.brandId.toString(),
        categoryId: doc.categoryId?.toString() ?? '',
        type: doc.type,
        method: doc.method,
        amount: doc.amount,
        commissionAmount: doc.commissionAmount ?? 0,
        brandNet: doc.brandNet ?? 0,
        status: doc.status,
        paidAt: doc.paidAt ? converToTimeZone(doc.paidAt) : null,
        createdAt: converToTimeZone(doc.createdAt),
    };
}
