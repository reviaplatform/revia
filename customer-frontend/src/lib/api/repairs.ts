import { apiClient } from './client';
import { RepairRequest, CreateRepairPayload, ApiResponse, PaginatedResponse } from './types';

export const getRepairs = async (): Promise<RepairRequest[]> => {
  const response = await apiClient.get<ApiResponse<RepairRequest[]>>('repair-requests');
  return response.data.data;
};

export const getRepair = async (id: string): Promise<RepairRequest> => {
  const response = await apiClient.get<ApiResponse<RepairRequest>>(`repair-requests/${id}`);
  return response.data.data;
};

export const createRepair = async (data: CreateRepairPayload): Promise<RepairRequest> => {
  const formData = new FormData();
  formData.append('deviceId', data.deviceId);
  formData.append('issueText', data.issueText);
  formData.append('flow', data.flow);
  
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await apiClient.post<ApiResponse<RepairRequest>>('repair-requests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const cancelRepair = async (id: string): Promise<RepairRequest> => {
  const response = await apiClient.delete<ApiResponse<RepairRequest>>(`repair-requests/${id}`);
  return response.data.data;
};

export const payInspection = async (requestId: string): Promise<{ paymentUrl: string }> => {
  const response = await apiClient.post<ApiResponse<{ paymentUrl: string }>>(`repair-requests/${requestId}/pay-inspection`);
  return response.data.data;
};

export const payFinal = async (requestId: string): Promise<{ paymentUrl: string }> => {
  const response = await apiClient.post<ApiResponse<{ paymentUrl: string }>>(`repair-requests/${requestId}/pay-final`);
  return response.data.data;
};

export const getInspectionResults = async (requestId: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`repair-requests/${requestId}/inspection`);
  return response.data.data;
};

export const submitReview = async (requestId: string, rating: number, comment: string): Promise<void> => {
  await apiClient.post(`repair-requests/${requestId}/review`, { rating, comment });
};

