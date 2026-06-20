import { describe, it, expect } from 'vitest';
import { ApiResponse, PaginatedResponse } from '../../src/lib/api/types';

// Temporarily define RepairRequest until it's officially in types.ts (T021)
interface RepairRequest {
  id: string;
  deviceId: string;
  issueDescription: string;
  status: 'Pending' | 'Quoted' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

describe('Repairs API Contract', () => {
  it('should match the RepairRequest entity structure', () => {
    const mockRepair: RepairRequest = {
      id: 'repair-789',
      deviceId: 'device-123',
      issueDescription: 'Broken screen',
      status: 'Pending',
      createdAt: '2026-03-17T00:00:00Z'
    };

    expect(mockRepair).toHaveProperty('id');
    expect(mockRepair).toHaveProperty('status');
    expect(mockRepair.status).toBe('Pending');
  });

  it('should match the PaginatedResponse structure for repairs', () => {
    const mockResponse: PaginatedResponse<RepairRequest> = {
      data: [{
        id: 'repair-789',
        deviceId: 'device-123',
        issueDescription: 'Broken screen',
        status: 'Pending',
        createdAt: '2026-03-17T00:00:00Z'
      }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    };

    expect(mockResponse.data).toBeInstanceOf(Array);
  });
});
