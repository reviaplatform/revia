"use client";

import { useState, useEffect, useCallback } from 'react';
import { getDevices } from '@/lib/api/devices';
import { Device } from '@/lib/api/types';

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 13 Pro',
      platform: 'iOS',
      manufacturer: 'Apple',
      deviceModel: '13 Pro',
      category: { id: 'cat-1', name: { en: 'Smartphone', ar: 'هاتف ذكي' } }
    },
    {
      id: '2',
      name: 'Samsung S22',
      platform: 'Android',
      manufacturer: 'Samsung',
      deviceModel: 'S22',
      category: { id: 'cat-1', name: { en: 'Smartphone', ar: 'هاتف ذكي' } }
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDevices();
      setDevices(res || []);
    } catch (err: any) {
      console.error('Failed to fetch devices', err);
      setError(err);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    isLoading,
    error,
    refetch: fetchDevices,
  };
}
