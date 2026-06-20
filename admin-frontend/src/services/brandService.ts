import { apiFetch } from "@/lib/api";

export interface BrandListItem {
  id: string;
  _id?: string;
  logo?: string;
  name?: {
    en: string;
    ar: string;
  } | string;
  crn?: string;
  tin?: string;
  branches?: Array<{
    name: { en: string; ar: string };
    location: { longitude: number; latitude: number; _id: string };
    isActive: boolean;
  }>;
  tags?: string[];
  allowPayUsePOS?: boolean;
  completedRepairs?: number;
  rating?: number;
  ratingCount?: number;
  categories?: Array<{
    name: { en: string; ar: string };
    commissionPerRequest: number;
  }>;
  approvedAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  status?: "pending" | "approved" | "banned" | "rejected" | string;
  isApproved?: boolean;
  isBanned?: boolean;
  visibility?: "Visible" | "Hidden" | string;
}

export interface BrandReview {
  id: string;
  repairRequestId: string;
  brandId: string;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customerName?: string;
  brandName?: string;
}

export type BrandReviewsResponse = BrandReview[];

export type GetBrandListResponse = {
  data?: BrandListItem[];
  items?: BrandListItem[];
  brands?: BrandListItem[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export const brandAdminApi = {
  /**
   * Fetch paginated brand data for tables or lists.
   * Send page and limit from UI pagination state.
   */
  getList: (page = 1, limit = 20) =>
    apiFetch<GetBrandListResponse | BrandListItem[]>(
      `/brand/list?page=${page}&limit=${limit}`,
      { method: "GET" }
    ),

  /**
   * Use this when an admin approves a pending brand.
   * Typically triggered from a row action button like "Approve".
   */
  approve: (id: string) =>
    apiFetch<{ message?: string }>(`/brand/${id}/approve`, {
      method: "POST",
    }),

  /**
   * Use this to ban or deactivate a brand.
   * Best used behind a confirmation dialog because this is a destructive action.
   */
  ban: (id: string) =>
    apiFetch<{ message?: string }>(`/brand/${id}/ban`, {
      method: "DELETE",
    }),

  /**
   * Use this to restore a banned brand.
   * Usually shown only when current brand status is banned.
   */
  unban: (id: string) =>
    apiFetch<{ message?: string }>(`/brand/${id}/unban`, {
      method: "PUT",
    }),

  /**
   * Fetch all reviews across all brands.
   */
  getAllReviews: () =>
    apiFetch<BrandReviewsResponse>("/brand/reviews/all", {
      method: "GET",
    }),

  /**
   * Fetch reviews for a specific brand.
   */
  getSpecificReviews: (id: string) =>
    apiFetch<BrandReviewsResponse>(`/brand/${id}/reviews`, {
      method: "GET",
    }),
};
