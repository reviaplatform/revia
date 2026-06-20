import { apiClient } from '@/lib/api';
import { Brand, BrandReview, UpdateBrandRequest } from '@/types/brand';

export const brandApi = {
    /**
     * Fetch the currently authenticated provider's brand details.
     * URL: GET /brand
     */
    getMyBrand: async () => {
        const res = await apiClient.get<{ data: Brand }>('/brand');
        return res.data.data;
    },

    /**
     * Fetch reviews related to the currently authenticated provider's brand.
     * URL: GET /brand/reviews
     */
    getMyBrandReviews: async () => {
        const res = await apiClient.get<{ data: BrandReview[] }>('/brand/reviews');
        return res.data.data;
    },

    /**
     * Update brand details for the authenticated provider.
     * URL: PATCH /brand/update
     * Note: Supporting FormData for potential logo uploads.
     */
    updateBrand: async (payload: FormData | UpdateBrandRequest) => {
        const res = await apiClient.put('/brand/update', payload);
        return res.data;
    }
};
