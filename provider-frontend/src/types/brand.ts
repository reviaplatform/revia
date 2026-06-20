export type LocalizedText = {
    en: string;
    ar: string;
};

export interface Brand {
    id: string;
    name: LocalizedText;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    description?: LocalizedText;
    crn?: string;
    tin?: string;
    categoryId?: string;
    allowPayUsePOS?: boolean;
    branches?: any[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BrandReview {
    id: string;
    rating: number;
    comment?: string;
    reviewerName?: string;
    createdAt?: string;
}

export interface UpdateBrandRequest {
    name?: {
        en?: string;
        ar?: string;
    };
    logo?: File;
    primaryColor?: string;
    secondaryColor?: string;
    description?: {
        en?: string;
        ar?: string;
    };
    allowPayUsePOS?: boolean;
}
