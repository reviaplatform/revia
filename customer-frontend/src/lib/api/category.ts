import { apiClient } from './client';
import { Category, PaginatedResponse, ApiResponse } from './types';

export const getCategoryList = async (): Promise<Category[]> => {
  const response = await apiClient.get<ApiResponse<Category[]>>('category/list');
  return response.data.data;
};

