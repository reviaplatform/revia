export interface CreateBrandReviewData {
    rating: number;     // 1 to 5
    comment?: string;   // optional feedback
}

export interface BrandReviewResult {
    id: string;
    repairRequestId: string;
    brandId: string;
    customerId: string;
    rating: number;
    comment?: string;
    createdAt: string;

    // Optional populated fields
    customerName?: string;
}
