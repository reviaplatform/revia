import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { IProviderDB } from '@/database/models/provider';
import BrandOfferModel, { IBrandOfferDB, BrandOfferStatus, IOfferItem } from '@/database/models/brandOffer';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';
import { CreateBrandOfferData, BrandOfferResult, OfferItemResult, BrandOfferResultUser } from './interfaces';
import { _formatBrandInUser } from '../brand';
import { IBrandDB } from '@/database/models/brand';
import CustomerModel from '@/database/models/customer';
import BrandModel from '@/database/models/brand';

function _calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ---------------------------------------------------------------------------
// Provider: create an offer for a repair request
// ---------------------------------------------------------------------------
export async function createBrandOffer(
    provider: IProviderDB,
    data: CreateBrandOfferData,
): AsyncSafeResult<BrandOfferResult> {
    try {
        const req = await RepairRequestModel.findById(data.repairRequestId);
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.PENDING_OFFERS) throw ApiError.invalidRepairRequestStatus();

        // Ensure this brand is actually assigned to the request
        const isAssigned = req.assignedBrandIds.some(
            (id: { toString(): string }) => id.toString() === provider.brandId.toString(),
        );
        if (!isAssigned) throw ApiError.notAllowed();

        const offerExist = await BrandOfferModel.findOne({
            repairRequestId: data.repairRequestId,
            brandId: provider.brandId,
        });
        if (offerExist) throw ApiError.duplicateBrandOffer();

        const customer = await CustomerModel.findById(req.customerId);
        const brand = await BrandModel.findById(provider.brandId);

        let calculatedDistance = data.distanceKm;
        if (customer?.location && brand?.branches && brand.branches[data.branchIndex]) {
            const branchLoc = brand.branches[data.branchIndex].location;
            if (branchLoc && branchLoc.latitude && branchLoc.longitude) {
                const dist = _calculateDistance(
                    customer.location.latitude,
                    customer.location.longitude,
                    branchLoc.latitude,
                    branchLoc.longitude
                );
                calculatedDistance = Number(dist.toFixed(2));
            }
        }

        const offer = await BrandOfferModel.create({
            repairRequestId: data.repairRequestId,
            brandId: provider.brandId,
            branchIndex: data.branchIndex,
            offerItems: data.offerItems.map((item) => ({
                expectedIssue: item.expectedIssue,
                priceRange: item.priceRange,
                expectedFinishDate: new Date(item.expectedFinishDate),
            })),
            distanceKm: calculatedDistance,
            inspectionPrice: data.inspectionPrice,
        });

        return { result: _formatBrandOffer(offer), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get all offers for a repair request
// ---------------------------------------------------------------------------
export async function getOffersForRequest(
    requestId: string,
    language: 'en' | 'ar'
): AsyncSafeResult<BrandOfferResultUser[]> {
    try {
        const request = await RepairRequestModel.findById(requestId);
        if (!request) throw ApiError.notFoundRepairRequest();
        const customer = await CustomerModel.findById(request.customerId);

        const offers = await BrandOfferModel.find({ repairRequestId: requestId }).populate('brandId').sort('-createdAt');

        const results = await Promise.all(offers.map(async (offer) => {
            const formatted = await _formatBrandOfferUser(offer, language);

            if (customer?.location && offer.brandId) {
                const brandDoc = offer.brandId as any;
                if (brandDoc && brandDoc.branches && brandDoc.branches[offer.branchIndex]) {
                    const branchLoc = brandDoc.branches[offer.branchIndex].location;
                    if (branchLoc && branchLoc.latitude && branchLoc.longitude) {
                        const dist = _calculateDistance(
                            customer.location.latitude,
                            customer.location.longitude,
                            branchLoc.latitude,
                            branchLoc.longitude
                        );
                        formatted.distanceKm = Number(dist.toFixed(2));
                    }
                }
            }
            return formatted;
        }));

        return { result: results, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get a single offer by ID
// ---------------------------------------------------------------------------
export async function getBrandOffer(offerId: string): AsyncSafeResult<BrandOfferResult> {
    try {
        const offer = await BrandOfferModel.findById(offerId);
        if (!offer) throw ApiError.notFoundBrandOffer();
        return { result: _formatBrandOffer(offer), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Internal: mark offer as accepted / rejected (called after customer selects)
// ---------------------------------------------------------------------------
export async function updateOfferStatus(
    offerId: string,
    status: BrandOfferStatus.ACCEPTED | BrandOfferStatus.REJECTED,
): AsyncSafeResult<BrandOfferResult> {
    try {
        const offer = await BrandOfferModel.findById(offerId);
        if (!offer) throw ApiError.notFoundBrandOffer();
        if (offer.status !== BrandOfferStatus.PENDING) throw ApiError.offerAlreadyResponded();

        offer.status = status;
        await offer.save();

        return { result: _formatBrandOffer(offer), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

function _formatOfferItem(item: IOfferItem): OfferItemResult {
    return {
        expectedIssue: item.expectedIssue,
        priceRange: item.priceRange,
        expectedFinishDate: converToTimeZone(item.expectedFinishDate),
    };
}

export function _formatBrandOffer(doc: IBrandOfferDB): BrandOfferResult {
    return {
        id: doc._id!.toString(),
        repairRequestId: doc.repairRequestId.toString(),
        brandId: doc.brandId.toString(),
        branchIndex: doc.branchIndex,
        offerItems: doc.offerItems.map(_formatOfferItem),
        distanceKm: doc.distanceKm,
        inspectionPrice: doc.inspectionPrice,
        status: doc.status,
        createdAt: converToTimeZone(doc.createdAt),
    };
}

export async function _formatBrandOfferUser(doc: IBrandOfferDB, language: 'en' | 'ar'): Promise<BrandOfferResultUser> {
    return {
        id: doc._id!.toString(),
        repairRequestId: doc.repairRequestId.toString(),
        brand: await _formatBrandInUser(doc.brandId as unknown as IBrandDB, language),
        offerItems: doc.offerItems.map(_formatOfferItem),
        distanceKm: doc.distanceKm,
        inspectionPrice: doc.inspectionPrice,
        status: doc.status,
        createdAt: converToTimeZone(doc.createdAt),
    };
}
