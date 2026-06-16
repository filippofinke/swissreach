/**
 * Colour scales and legend definitions for the isochrone surface.
 *
 * - "time"     : a continuous perceptual scale (fast = teal/green, slow = red),
 *                clamped to [0, maxMinutes].
 * - "transfers": a discrete scale (0, 1, 2, 3+ transfers).
 */
import { interpolateTurbo } from 'd3-scale-chromatic';
import type { Metric } from '../state/types';

export type LegendEntry = { label: string; color: string; value: number };

// Discrete palette for the number of transfers.
const TRANSFER_COLORS = ['#1a9850', '#fee08b', '#fc8d59', '#d73027', '#7b3294'];

/**
 * Colour for a travel time. Maps 0..max onto a slice of the Turbo colormap
 * (skipping the very dark blue/maroon extremes for legibility on a map).
 */
export function colorForTime(minutes: number, maxMinutes: number): string {
  const clamped = Math.max(0, Math.min(minutes, maxMinutes));
  const t = maxMinutes > 0 ? clamped / maxMinutes : 0;
  // Use the 0.12..0.92 band of Turbo: teal → green → yellow → orange → red.
  return interpolateTurbo(0.12 + t * 0.8);
}

export function colorForTransfers(transfers: number): string {
  const i = Math.max(0, Math.min(transfers, TRANSFER_COLORS.length - 1));
  return TRANSFER_COLORS[i];
}

export function colorFor(metric: Metric, value: number, maxMinutes: number): string {
  return metric === 'time' ? colorForTime(value, maxMinutes) : colorForTransfers(value);
}

export function legendEntries(
  metric: Metric,
  maxMinutes: number,
  maxTransfers: number,
): LegendEntry[] {
  if (metric === 'transfers') {
    const labels = ['Direct', '1 change', '2 changes', '3 changes', '4+ changes'];
    const n = Math.min(maxTransfers + 1, labels.length);
    return Array.from({ length: n }, (_, i) => ({
      label: labels[i],
      color: colorForTransfers(i),
      value: i,
    }));
  }
  // Time: ticks at 0, then ~6 evenly spaced steps rounded to 5 min.
  const steps = 6;
  const entries: LegendEntry[] = [];
  for (let i = 0; i <= steps; i++) {
    const v = Math.round((maxMinutes * i) / steps / 5) * 5;
    entries.push({
      label: i === 0 ? '0 min' : `${v} min`,
      color: colorForTime(v, maxMinutes),
      value: v,
    });
  }
  return entries;
}
