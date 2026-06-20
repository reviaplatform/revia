import { describe, it, expect } from 'vitest';
import { Device, ApiResponse, PaginatedResponse } from '../../src/lib/api/types';

describe('Devices API Contract', () => {
  it('should match the Device entity structure', () => {
    const mockDevice: Device = {
      id: 'uuid-123',
      category: {
        id: 'cat-456',
        name: { en: 'Smartphone', ar: 'هاتف ذكي' }
      },
      name: 'iPhone 15 Pro',
      manufacturer: 'Apple',
      platform: 'iOS',
      deviceModel: 'A2848',
      osVersion: '17.0',
      createdAt: '2026-03-17T00:00:00Z',
      updatedAt: '2026-03-17T00:00:00Z'
    };

    expect(mockDevice).toHaveProperty('id');
    expect(mockDevice).toHaveProperty('category');
    expect(mockDevice).toHaveProperty('name');
    expect(mockDevice).toHaveProperty('platform');
    expect(mockDevice).toHaveProperty('deviceModel');
  });

  it('should match the PaginatedResponse structure for devices', () => {
    const mockResponse: PaginatedResponse<Device> = {
      data: [
        {
          id: 'uuid-123',
          category: {
            id: 'cat-456',
            name: { en: 'Smartphone', ar: 'هاتف ذكي' }
          },
          name: 'iPhone 15 Pro',
          manufacturer: 'Apple',
          platform: 'iOS',
          deviceModel: 'A2848'
        }
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    };

    expect(mockResponse.data).toBeInstanceOf(Array);
    expect(mockResponse.data[0]).toHaveProperty('name');
  });

  it('should match the ApiResponse envelope for a single device', () => {
    const mockEnvelope: ApiResponse<Device> = {
      data: {
        id: 'uuid-123',
        category: {
          id: 'cat-456',
          name: { en: 'Smartphone', ar: 'هاتف ذكي' }
        },
        name: 'iPhone 15 Pro',
        manufacturer: 'Apple',
        platform: 'iOS',
        deviceModel: 'A2848'
      }
    };

    expect(mockEnvelope).toHaveProperty('data');
    expect(mockEnvelope.data).toHaveProperty('id');
  });
});
