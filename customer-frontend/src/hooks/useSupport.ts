"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupportTickets } from '@/lib/api/support';
import { SupportTicket } from '@/lib/api/types';

export function useSupport() {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSupportTickets();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch support tickets', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTickets,
  };
}
