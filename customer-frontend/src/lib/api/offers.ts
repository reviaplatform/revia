import { apiClient } from './client';
import { Offer, ApiResponse } from './types';

export interface RemainingOffersStatus {
  requestId: string;
  assignedBrandsCount: number;
  offersCount: number;
  remainingCount: number;
}

export const getOffers = async (requestId: string): Promise<Offer[]> => {
  const response = await apiClient.get<ApiResponse<Offer[]>>(`repair-requests/${requestId}/offers`);
  return response.data.data;
};

export const acceptOffer = async (requestId: string, offerId: string): Promise<{ offer: Offer, status: string }> => {
  const response = await apiClient.post<ApiResponse<{ offer: Offer, status: string }>>(`repair-requests/${requestId}/select-offer`, { offerId });
  return response.data.data;
};

export const getRemainingOffersStatus = async (requestId: string): Promise<RemainingOffersStatus> => {
  const response = await apiClient.get<ApiResponse<RemainingOffersStatus>>(`repair-requests/${requestId}/remaining-offers`);
  return response.data.data;
};
