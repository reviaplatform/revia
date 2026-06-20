import { apiClient } from './client';
import { Device, CreateDevicePayload, UpdateDevicePayload, ApiResponse } from './types';

export const getDevices = async (): Promise<Device[]> => {
  const response = await apiClient.get<ApiResponse<Device[]>>('devices');
  return response.data.data;
};

export const getDevice = async (id: string): Promise<Device> => {
  const response = await apiClient.get<ApiResponse<Device>>(`devices/${id}`);
  return response.data.data;
};

export const createDevice = async (data: CreateDevicePayload): Promise<Device> => {
  const response = await apiClient.post<ApiResponse<Device>>('devices', data);
  return response.data.data;
};

export const updateDevice = async (id: string, data: UpdateDevicePayload): Promise<Device> => {
  const response = await apiClient.patch<ApiResponse<Device>>(`devices/${id}`, data);
  return response.data.data;
};

export const deleteDevice = async (id: string): Promise<void> => {
  await apiClient.delete(`devices/${id}`);
};

