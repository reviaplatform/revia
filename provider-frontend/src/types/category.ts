export interface Category {
    id: string;
    name: {
        en: string;
        ar: string;
    };
    image?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryListResponse {
    message: string;
    data: {
        docs: Category[];
        totalDocs: number;
        limit: number;
        totalPages: number;
        page: number;
        pagingCounter: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number | null;
        nextPage: number | null;
    };
}
