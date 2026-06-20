import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { ICustomerDB } from '@/database/models/customer';
import { IProviderDB } from '@/database/models/provider';
import { IDeviceDB } from '@/database/models/device';
import { ICategoryDB } from '@/database/models/category';
import BrandOfferModel, { BrandOfferStatus } from '@/database/models/brandOffer';
import RepairRequestModel, {
    IRepairRequestDB,
    RepairRequestFlow,
    RepairRequestStatus,
} from '@/database/models/repairRequest';
import { CreateRepairRequestData, RepairRequestPrviderResult, RepairRequestResult } from './interfaces';
import BrandModel, { IBrandDB } from '@/database/models/brand';
import { _formatDeviceProvider } from '../device';
import { _formatBrandOffer } from '../brandOffer';
import PaymentModel, { PaymentType } from '@/database/models/payment';
import BrandReviewModel from '@/database/models/brandReview';
import { _formatInspection } from '../inspection';
import InspectionModel from '@/database/models/inspection';
import { MatchingProvider, runMatchingPipeline } from '@/core/matching';
import CustomerModel from '@/database/models/customer';

// ---------------------------------------------------------------------------
// Customer: create a new repair request
// ---------------------------------------------------------------------------
export async function createRepairRequest(
    customer: ICustomerDB,
    data: CreateRepairRequestData,
): AsyncSafeResult<RepairRequestResult> {
    try {
        // Flow 2 starts in ai_assessing while the customer chats with AI
        const initialStatus =
            data.flow == RepairRequestFlow.AI_CHAT
                ? RepairRequestStatus.AI_ASSESSING
                : RepairRequestStatus.PENDING_BRAND_SELECTION;

        const req = await RepairRequestModel.create({
            customerId: customer._id,
            deviceId: data.deviceId,
            issueText: data.issueText,
            flow: data.flow,
            status: initialStatus,
        });

        if (initialStatus == RepairRequestStatus.PENDING_BRAND_SELECTION) {
            await assignBrandsToRequest(req._id.toString())
        }

        const populated = await RepairRequestModel.findById(req._id).populate('deviceId');
        return { result: await _formatRepairRequest(populated!, false), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get all own repair requests
// ---------------------------------------------------------------------------
export async function getCustomerRepairRequests(
    customer: ICustomerDB,
): AsyncSafeResult<RepairRequestResult[]> {
    try {
        const requests = await RepairRequestModel.find({ customerId: customer._id })
            .populate('deviceId')
            .sort('-createdAt');
        return { result: await Promise.all(requests.map(rr => _formatRepairRequest(rr, true))), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get single repair request (must be owner)
// ---------------------------------------------------------------------------
export async function getRepairRequest(
    customer: ICustomerDB,
    requestId: string,
): AsyncSafeResult<RepairRequestResult> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId, customerId: customer._id }).populate('deviceId');
        if (!req) throw ApiError.notFoundRepairRequest();
        return { result: await _formatRepairRequest(req, true), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: cancel a repair request
// ---------------------------------------------------------------------------
export async function cancelRepairRequest(
    customer: ICustomerDB,
    requestId: string,
): AsyncSafeResult<RepairRequestResult> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId, customerId: customer._id });
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status === RepairRequestStatus.CANCELLED) throw ApiError.repairRequestAlreadyCancelled();

        const nonCancellableStatuses: RepairRequestStatus[] = [
            RepairRequestStatus.COMPLETED,
            RepairRequestStatus.PENDING_PROVIDER_REPAIR,
        ];
        if (nonCancellableStatuses.includes(req.status)) throw ApiError.invalidRepairRequestStatus();

        req.status = RepairRequestStatus.CANCELLED;
        await req.save();

        return { result: await _formatRepairRequest(req, false), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: select a brand offer
// ---------------------------------------------------------------------------
export async function selectBrandOffer(
    customer: ICustomerDB,
    requestId: string,
    offerId: string,
): AsyncSafeResult<RepairRequestResult> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId, customerId: customer._id });
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.PENDING_OFFERS) throw ApiError.invalidRepairRequestStatus();

        // Check if offer belongs to this request
        const offer = await BrandOfferModel.findById(offerId);
        if (!offer || offer.repairRequestId.toString() !== requestId) {
            throw ApiError.notFoundBrandOffer();
        }

        req.selectedOfferId = offerId as unknown as typeof req.selectedOfferId;
        req.status = RepairRequestStatus.OFFER_SELECTED;
        await req.save();

        // Accept the chosen offer and reject every other pending offer on this request,
        // so losing brands stop seeing it as an active job.
        await BrandOfferModel.updateOne({ _id: offerId }, { status: BrandOfferStatus.ACCEPTED });
        await BrandOfferModel.updateMany(
            { repairRequestId: req._id, _id: { $ne: offerId }, status: BrandOfferStatus.PENDING },
            { status: BrandOfferStatus.REJECTED },
        );

        const populated = await RepairRequestModel.findById(req._id).populate('deviceId');
        return { result: await _formatRepairRequest(populated!, false), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: assign brands to a pending request (uses the Matching Engine)
// ---------------------------------------------------------------------------
export async function assignBrandsToRequest(
    requestId: string,
): AsyncSafeResult<null> {
    try {
        const req = await RepairRequestModel.findById(requestId)
            .populate({ path: 'deviceId', populate: { path: 'categoryId' } });
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.PENDING_BRAND_SELECTION)
            throw ApiError.invalidRepairRequestStatus();

        const device = req.deviceId as unknown as IDeviceDB & { categoryId: ICategoryDB };

        // Fetch the customer document so we can pass their saved GPS location to the matching engine
        const customer = await CustomerModel.findById(req.customerId);

        // Fetch all active, approved brands with their categories populated.
        // We use a raw document cast to sidestep the ObjectId[] vs ICategoryDB[] mismatch
        // that exists in IBrandDB — populate replaces ObjectIds with full documents at runtime.
        type PopulatedBrand = Omit<IBrandDB, 'categories'> & { categories: ICategoryDB[] };
        const brands = (await BrandModel.find({
            deletedAt: null,
            approvedAt: { $ne: null },
        }).populate('categories')) as unknown as PopulatedBrand[];

        // Build the provider profiles expected by the matching engine.
        // Includes branches so the geospatial engine can compute proximity.
        const providers: MatchingProvider[] = brands.map(brand => ({
            _id: brand._id!.toString(),
            name: brand.name,
            tags: brand.tags,
            categories: brand.categories.map(cat => ({
                _id: cat._id!.toString(),
                name: cat.name,
                isActive: cat.isActive,
            })),
            branches: (brand.branches ?? []).map(branch => ({
                name: branch.name,
                location: {
                    longitude: branch.location.longitude,
                    latitude: branch.location.latitude,
                },
                isActive: branch.isActive,
            })),
            completedRepairs: brand.completedRepairs,
            rating: brand.rating,
            ratingCount: brand.ratingCount,
            lockedBalance: brand.lockedBalance,
            deletedAt: brand.deletedAt,
        }));

        const categoryName = device.categoryId?.name?.en ?? '';
        const ticket = {
            device_type: categoryName.toLowerCase().trim(),
            device_brand: device.manufacturer.toLowerCase().trim(),
            symptom: req.issueText,
            probable_cause: req.aiReport.join(' '),
            // Pass customer location when available so geospatial scoring activates
            ...(customer?.location
                ? {
                      location: {
                          latitude: customer.location.latitude,
                          longitude: customer.location.longitude,
                      },
                  }
                : {}),
        };

        // Run the full pipeline: filter → score (Bayesian + geospatial) → rank, assign top 5
        const rankedBrandIds = runMatchingPipeline(ticket, providers, 5);

        req.assignedBrandIds = rankedBrandIds as unknown as typeof req.assignedBrandIds;
        req.status = RepairRequestStatus.PENDING_OFFERS;
        await req.save();

        return { result: null, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: get all repair requests
// ---------------------------------------------------------------------------
export async function adminGetAllRepairRequests(): AsyncSafeResult<RepairRequestResult[]> {
    try {
        const requests = await RepairRequestModel.find().populate('deviceId').sort('-createdAt');
        return { result: await Promise.all(requests.map(rr => _formatRepairRequest(rr, false))), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: get single repair request by ID
// ---------------------------------------------------------------------------
export async function adminGetRepairRequestById(
    requestId: string,
): AsyncSafeResult<RepairRequestResult> {
    try {
        const req = await RepairRequestModel.findById(requestId).populate('deviceId');
        if (!req) throw ApiError.notFoundRepairRequest();
        return { result: await _formatRepairRequest(req, false), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Internal: once a request has moved past the offer stage, only the brand
// whose offer was accepted may still see/act on it — losing brands are hidden.
// ---------------------------------------------------------------------------
async function isWinningBrand(req: IRepairRequestDB, brandId: string): Promise<boolean> {
    if (!req.selectedOfferId) return true;
    const offer = await BrandOfferModel.findOne({ repairRequestId: req._id, brandId });
    return offer?.status === BrandOfferStatus.ACCEPTED;
}

// ---------------------------------------------------------------------------
// Provider: requests pending offers (brand should send an offer)
// ---------------------------------------------------------------------------
export async function providerGetPendingOfferRequests(
    provider: IProviderDB,
): AsyncSafeResult<RepairRequestPrviderResult[]> {
    try {
        const requests = await RepairRequestModel.find({
            assignedBrandIds: provider.brandId,
            status: RepairRequestStatus.PENDING_OFFERS,
        }).populate('deviceId').sort('-createdAt');
        return { result: await Promise.all(requests.map(req => _formatRepairRequestProvider(req, provider.brandId.toString()))), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: active requests (past offer stage — in progress with this brand)
// ---------------------------------------------------------------------------
export async function providerGetActiveRequests(
    provider: IProviderDB,
): AsyncSafeResult<RepairRequestPrviderResult[]> {
    try {
        const activeStatuses = [
            RepairRequestStatus.OFFER_SELECTED,
            RepairRequestStatus.INSPECTION_PENDING,
            RepairRequestStatus.INSPECTION_DONE,
            RepairRequestStatus.PAYMENT_PENDING,
            RepairRequestStatus.PAYMENT_DONE,
            RepairRequestStatus.PENDING_PROVIDER_REPAIR,
            RepairRequestStatus.PENDING_USER_DEVICE_PICKUP,
            RepairRequestStatus.COMPLETED,
        ];
        const requests = await RepairRequestModel.find({
            assignedBrandIds: provider.brandId,
            status: { $in: activeStatuses },
        }).populate('deviceId').sort('-createdAt');

        const brandId = provider.brandId.toString();
        const ownRequests = (
            await Promise.all(requests.map(async (req) => ((await isWinningBrand(req, brandId)) ? req : null)))
        ).filter((req): req is IRepairRequestDB => req !== null);

        return { result: await Promise.all(ownRequests.map(req => _formatRepairRequestProvider(req, brandId))), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export async function providerGetRepairRequestById(
    provider: IProviderDB,
    requestId: string,
): AsyncSafeResult<RepairRequestPrviderResult> {
    try {
        const req = await RepairRequestModel.findOne({
            _id: requestId,
            assignedBrandIds: provider.brandId,
        }).populate('deviceId');
        if (!req) throw ApiError.notFoundRepairRequest();
        if (!(await isWinningBrand(req, provider.brandId.toString()))) throw ApiError.notFoundRepairRequest();
        return { result: await _formatRepairRequestProvider(req, provider.brandId.toString()), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: mark repair as done — customer must collect device
// ---------------------------------------------------------------------------
export async function providerFinishRepair(
    provider: IProviderDB,
    requestId: string,
): AsyncSafeResult<RepairRequestResult> {
    try {
        const req = await RepairRequestModel.findOne({
            _id: requestId,
            assignedBrandIds: provider.brandId,
        }).populate('deviceId');
        if (!req) throw ApiError.notFoundRepairRequest();
        if (!(await isWinningBrand(req, provider.brandId.toString()))) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.PENDING_PROVIDER_REPAIR) throw ApiError.invalidRepairRequestStatus();

        req.status = RepairRequestStatus.PENDING_USER_DEVICE_PICKUP;
        await req.save();

        return { result: await _formatRepairRequest(req, false), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export async function providerGiveDeviceToUser(
    provider: IProviderDB,
    requestId: string,
): AsyncSafeResult<RepairRequestResult> {
    try {
        const req = await RepairRequestModel.findOne({
            _id: requestId,
            assignedBrandIds: provider.brandId,
        }).populate('deviceId');
        if (!req) throw ApiError.notFoundRepairRequest();
        if (!(await isWinningBrand(req, provider.brandId.toString()))) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.PENDING_USER_DEVICE_PICKUP) throw ApiError.invalidRepairRequestStatus();

        req.status = RepairRequestStatus.COMPLETED;
        await req.save();

        return { result: await _formatRepairRequest(req, false), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export async function _formatRepairRequest(doc: IRepairRequestDB, showIsReview: boolean): Promise<RepairRequestResult> {
    const device = doc.deviceId as unknown as IDeviceDB | null;
    const isReview = showIsReview ? await BrandReviewModel.findOne({ repairRequestId: doc._id!.toString() }) : null

    return {
        id: doc._id!.toString(),
        customerId: doc.customerId.toString(),
        deviceId: device?._id!.toString() ?? doc.deviceId.toString(),
        deviceName: device?.name ?? doc.deviceId.toString(),
        issueText: doc.issueText,
        flow: doc.flow,
        status: doc.status,
        aiReport: doc.aiReport,
        statusLogs: (doc.statusLogs || []).map(log => ({
            status: log.status,
            timestamp: converToTimeZone(log.timestamp),
        })),
        selectedOfferId: doc.selectedOfferId?.toString() ?? null,
        createdAt: converToTimeZone(doc.createdAt),
        isReview: showIsReview ? (isReview ? true : false) : undefined,
        review: isReview ? {
            rating: isReview.rating,
            comment: isReview.comment,
            createdAt: converToTimeZone(isReview.createdAt),
        } : undefined,
    };
}

export async function _formatRepairRequestProvider(doc: IRepairRequestDB, brandId: string): Promise<RepairRequestPrviderResult> {
    const device = doc.deviceId as unknown as IDeviceDB | null;
    const isSendOffer = await BrandOfferModel.findOne({ repairRequestId: doc._id!, brandId })
    const inspectionPayment = await PaymentModel.findOne({ repairRequestId: doc._id!, brandId, type: PaymentType.INSPECTION })
    const finalPayment = await PaymentModel.findOne({ repairRequestId: doc._id!, brandId, type: PaymentType.FINAL })
    const inspection = await InspectionModel.findOne({ repairRequestId: doc._id!, brandId })

    return {
        id: doc._id!.toString(),
        device: _formatDeviceProvider(device!),
        issueText: doc.issueText,
        status: doc.status,
        aiReport: doc.aiReport,
        statusLogs: (doc.statusLogs || []).map(log => ({
            status: log.status,
            timestamp: converToTimeZone(log.timestamp),
        })),
        selectedOfferId: doc.selectedOfferId?.toString() ?? null,
        createdAt: converToTimeZone(doc.createdAt),
        isSendOffer: isSendOffer ? true : false,
        offer: isSendOffer ? _formatBrandOffer(isSendOffer) : null,
        inspectionPayment: inspectionPayment ? {
            method: inspectionPayment.method,
            amount: inspectionPayment.amount,
            commissionAmount: inspectionPayment.commissionAmount,
            brandNet: inspectionPayment.brandNet,
            status: inspectionPayment.status,
            paidAt: inspectionPayment.paidAt ? converToTimeZone(inspectionPayment.paidAt) : null
        } : null,
        finalPayment: finalPayment ? {
            method: finalPayment.method,
            amount: finalPayment.amount,
            commissionAmount: finalPayment.commissionAmount,
            brandNet: finalPayment.brandNet,
            status: finalPayment.status,
            paidAt: finalPayment.paidAt ? converToTimeZone(finalPayment.paidAt) : null
        } : null,
        inspection: inspection ? _formatInspection(inspection) : null,
    };
}
