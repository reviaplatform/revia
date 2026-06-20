import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { ICustomerDB } from '@/database/models/customer';
import { IProviderDB } from '@/database/models/provider';
import BrandReviewModel, { IBrandReviewDB } from '@/database/models/brandReview';
import BrandModel from '@/database/models/brand';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';
import { CreateBrandReviewData, BrandReviewResult } from './interfaces';

// ---------------------------------------------------------------------------
// Customer: Create a review for a completed repair request
// ---------------------------------------------------------------------------
export async function createBrandReview(
    customer: ICustomerDB,
    requestId: string,
    data: CreateBrandReviewData,
): AsyncSafeResult<BrandReviewResult> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId, customerId: customer._id });
        if (!req) throw ApiError.notFoundRepairRequest();

        // Ensure request is fully completed
        if (req.status !== RepairRequestStatus.COMPLETED) {
            throw ApiError.cannotReviewUncompletedRequest();
        }

        // Find the brand that completed the repair
        // The assignedBrandIds should contain the brand that was selected
        // We can just use assignedBrandIds[0] if the list was filtered, 
        // but let's be safe: during completion, the brandId is from the accepted offer. 
        // We can look up the Inspection or BrandOffer if needed to get the exact brandId,
        // or just rely on the assignedBrandIds assuming the platform prunes it to just the accepted one. 
        // Wait, the schema has selectedOfferId. We should get it from the offer.
        await req.populate('selectedOfferId');
        const offer = req.selectedOfferId as any; // Type hack for populated offer
        if (!offer || !offer.brandId) {
            throw ApiError.notFoundBrand();
        }

        const brandId = offer.brandId;

        // Ensure this user hasn't already reviewed this request
        const existingReview = await BrandReviewModel.findOne({ repairRequestId: requestId });
        if (existingReview) {
            throw ApiError.duplicateBrandReview();
        }

        const review = await BrandReviewModel.create({
            customerId: customer._id,
            brandId: brandId,
            repairRequestId: requestId,
            rating: data.rating,
            comment: data.comment,
        });

        // Update Brand Rating
        const brand = await BrandModel.findById(brandId);
        if (brand) {
            const currentTotalScore = brand.rating * brand.ratingCount;
            const newTotalScore = currentTotalScore + data.rating;
            brand.ratingCount += 1;
            brand.rating = newTotalScore / brand.ratingCount;
            await brand.save();
        }

        const populated = await BrandReviewModel.findById(review._id).populate('customerId', 'name');
        return { result: _formatBrandReview(populated!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer / Public: Get reviews of a specific brand
// ---------------------------------------------------------------------------
export async function getBrandReviews(
    brandId: string,
): AsyncSafeResult<BrandReviewResult[]> {
    try {
        const reviews = await BrandReviewModel.find({ brandId })
            .populate('customerId', 'name')
            .sort('-createdAt');
        return { result: reviews.map(_formatBrandReview), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: Get own brand reviews
// ---------------------------------------------------------------------------
export async function providerGetOwnBrandReviews(
    provider: IProviderDB,
): AsyncSafeResult<BrandReviewResult[]> {
    try {
        const reviews = await BrandReviewModel.find({ brandId: provider.brandId })
            .populate('customerId', 'name')
            .sort('-createdAt');
        return { result: reviews.map(_formatBrandReview), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Get all reviews
// ---------------------------------------------------------------------------
export async function adminGetAllBrandReviews(): AsyncSafeResult<BrandReviewResult[]> {
    try {
        const reviews = await BrandReviewModel.find()
            .populate('customerId', 'name')
            .sort('-createdAt');
        return { result: reviews.map(_formatBrandReview), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export function _formatBrandReview(doc: IBrandReviewDB): BrandReviewResult {
    const customer = doc.customerId as any;
    return {
        id: doc._id!.toString(),
        repairRequestId: doc.repairRequestId.toString(),
        brandId: doc.brandId.toString(),
        customerId: customer._id ? customer._id.toString() : doc.customerId.toString(),
        customerName: customer.name ?? undefined,
        rating: doc.rating,
        comment: doc.comment,
        createdAt: converToTimeZone(doc.createdAt),
    };
}
