import { apiClient } from './client';
import { Payment, ApiResponse } from './types';

export const initiatePayment = async (requestId: string, type: 'inspection' | 'final', callbackUrls: { success: string; cancel: string }): Promise<{ checkoutUrl: string }> => {
  const response = await apiClient.post<ApiResponse<{ checkoutUrl: string }>>('payments/initiate', {
    requestId,
    type,
    callbackUrls
  });
  return response.data.data;
};

export const verifyPayment = async (requestId: string, transactionReference: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<Payment>>(`payments/verify/${transactionReference}?requestId=${requestId}`);
  return response.data.data;
};
