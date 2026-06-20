"use client";

import { useState, useEffect, useCallback } from 'react';
import { getProfile } from '@/lib/api/profile';
import { Profile } from '@/lib/api/types';
import { useAuth } from '@/context/AuthContext';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // We depend on auth state. If not authenticated, we shouldn't try to fetch
  const { accessToken, user } = useAuth();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err);
      // Fallback to context user if API fails (as a safety measure)
      if (user) {
        setProfile(user as Profile);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile
  };
}
