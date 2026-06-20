export interface CreateInspectionData {
    resultNotes: string;
    finalPrice: number;
    images?: string[];
}

export interface InspectionResult {
    id: string;
    repairRequestId: string;
    brandOfferId: string;
    brandId: string;
    customerId: string;
    resultNotes: string;
    finalPrice: number;
    images: string[];
    createdAt: string;
}
