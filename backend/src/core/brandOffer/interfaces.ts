import { BrandOfferStatus } from '@/database/models/brandOffer';
import { BrandResultInUser } from '../brand/interfaces';

export interface OfferItemData {
    expectedIssue: string;
    priceRange: { min: number; max: number };
    expectedFinishDate: string;
}

export interface CreateBrandOfferData {
    repairRequestId: string;
    branchIndex: number;
    offerItems: OfferItemData[];
    distanceKm: number;
    inspectionPrice: number;
}

export interface OfferItemResult {
    expectedIssue: string;
    priceRange: { min: number; max: number };
    expectedFinishDate: string;
}

export interface BrandOfferResult {
    id: string;
    repairRequestId: string;
    brandId: string;
    branchIndex: number;
    offerItems: OfferItemResult[];
    distanceKm: number;
    inspectionPrice: number;
    status: BrandOfferStatus;
    createdAt: string;
}

export interface BrandOfferResultUser {
    id: string;
    repairRequestId: string;
    brand: BrandResultInUser;
    offerItems: OfferItemResult[];
    distanceKm: number;
    inspectionPrice: number;
    status: BrandOfferStatus;
    createdAt: string;
}
