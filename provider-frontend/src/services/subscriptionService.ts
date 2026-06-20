import { apiClient } from '@/lib/api';
import { PricingInfo, Subscription } from '@/types/subscription';

export const subscriptionService = {
  getPricing: async (): Promise<PricingInfo> => {
    const response = await apiClient.get('/subscription/pricing');
    return response.data.data;
  },

  requestSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post('/subscription');
    return response.data.data;
  },

  getMySubscription: async (): Promise<Subscription | null> => {
    const response = await apiClient.get('/subscription');
    return response.data.data;
  },
};
