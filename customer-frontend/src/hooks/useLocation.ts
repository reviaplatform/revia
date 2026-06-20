"use client";

import { useState, useCallback } from 'react';
import { updateLocation } from '@/lib/api/profile';

export type LocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'granted'; latitude: number; longitude: number }
  | { status: 'denied'; reason: string }
  | { status: 'saving' }
  | { status: 'saved'; latitude: number; longitude: number }
  | { status: 'error'; reason: string };

/**
 * Hook that requests the browser's Geolocation API, then persists the
 * coordinates to the backend via PUT /me.
 *
 * The saved coordinates are forwarded to the matching engine so providers
 * are ranked by branch proximity when a repair request is created.
 */
export function useLocation(
  initialLocation?: { latitude: number; longitude: number } | null,
  options?: {
    onSaved?: (latitude: number, longitude: number) => void;
    onCleared?: () => void;
  }
) {
  const [state, setState] = useState<LocationState>(
    initialLocation
      ? { status: 'saved', latitude: initialLocation.latitude, longitude: initialLocation.longitude }
      : { status: 'idle' },
  );

  /**
   * Ask the browser for the current position and save it to the backend.
   */
  const requestAndSave = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'denied', reason: 'Geolocation is not supported by your browser.' });
      return;
    }

    setState({ status: 'requesting' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setState({ status: 'saving' });

        try {
          await updateLocation({ latitude, longitude });
          setState({ status: 'saved', latitude, longitude });
          options?.onSaved?.(latitude, longitude);
        } catch {
          setState({ status: 'error', reason: 'Failed to save location to server.' });
        }
      },
      (err) => {
        let reason = 'Location access was denied.';
        if (err.code === err.POSITION_UNAVAILABLE) reason = 'Location information is unavailable.';
        if (err.code === err.TIMEOUT) reason = 'The request to get your location timed out.';
        setState({ status: 'denied', reason });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [options]);

  /**
   * Save manual coordinates to the backend.
   */
  const saveManualLocation = useCallback(async (latitude: number, longitude: number) => {
    setState({ status: 'saving' });
    try {
      await updateLocation({ latitude, longitude });
      setState({ status: 'saved', latitude, longitude });
      options?.onSaved?.(latitude, longitude);
    } catch {
      setState({ status: 'error', reason: 'Failed to save location to server.' });
    }
  }, [options]);

  /**
   * Clear the stored location from the backend.
   */
  const clearLocation = useCallback(async () => {
    try {
      await updateLocation(null);
      setState({ status: 'idle' });
      options?.onCleared?.();
    } catch {
      setState({ status: 'error', reason: 'Failed to clear location.' });
    }
  }, [options]);

  const isLoading = state.status === 'requesting' || state.status === 'saving';
  const hasLocation = state.status === 'saved';
  const coords = hasLocation ? { latitude: state.latitude, longitude: state.longitude } : null;

  return {
    state,
    isLoading,
    hasLocation,
    coords,
    requestAndSave,
    saveManualLocation,
    clearLocation,
  };
}
