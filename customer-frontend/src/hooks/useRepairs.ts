"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRepairs } from '@/lib/api/repairs';
import { RepairRequest, RepairRequestStatus, RepairRequestFlow } from '@/lib/api/types';

export function useRepairs() {
  const [data, setData] = useState<RepairRequest[]>([
    {
      id: '1',
      customerId: 'user-1',
      deviceId: 'dev-1',
      deviceName: 'iPhone 13 Pro',
      flow: RepairRequestFlow.AI_CHAT,
      status: RepairRequestStatus.AI_ASSESSING,
      issueText: 'Screen is cracked and touch not working',
      aiReport: [],
      statusLogs: [],
      createdAt: new Date().toISOString(),
      isReview: false,
      device: { 
        id: 'dev-1', 
        name: 'iPhone 13 Pro', 
        manufacturer: 'Apple', 
        deviceModel: '13 Pro', 
        platform: 'iOS',
        category: { id: 'c1', name: { en: 'Phone', ar: 'هاتف' } }
      } as any
    },
    {
      id: '2',
      customerId: 'user-1',
      deviceId: 'dev-2',
      deviceName: 'Samsung S22',
      flow: RepairRequestFlow.DIRECT,
      status: RepairRequestStatus.OFFER_SELECTED,
      issueText: 'Battery draining very fast',
      aiReport: [],
      statusLogs: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isReview: false,
      device: { 
        id: 'dev-2', 
        name: 'Samsung S22', 
        manufacturer: 'Samsung', 
        deviceModel: 'S22', 
        platform: 'Android',
        category: { id: 'c1', name: { en: 'Phone', ar: 'هاتف' } }
      } as any
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepairs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getRepairs();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch repairs', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRepairs,
  };
}
