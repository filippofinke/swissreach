/**
 * One-shot geolocation hook. Resolves the browser's current position once
 * `enabled` becomes true, or `null` when geolocation is denied/unavailable.
 */
import { useEffect, useState } from 'react';

export type Position = { lat: number; lon: number };

/** Loose bbox around Switzerland, including narrow slivers of neighbours. */
export function inApproxSwissBounds(lat: number, lon: number): boolean {
  return lat >= 45.8 && lat <= 47.9 && lon >= 5.9 && lon <= 10.6;
}

export function useGeolocation(enabled: boolean): {
  position: Position | null;
  resolved: boolean;
} {
  const [position, setPosition] = useState<Position | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setResolved(true);
      return;
    }
    if (!('geolocation' in navigator)) {
      setResolved(true);
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setResolved(true);
      },
      () => {
        if (!cancelled) setResolved(true);
      },
      { timeout: 6000, maximumAge: 600_000, enableHighAccuracy: false },
    );
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { position, resolved };
}
