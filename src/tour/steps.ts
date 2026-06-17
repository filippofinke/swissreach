/**
 * Builds the ordered driver.js step list for the first-launch guided tour.
 *
 * Steps anchor to stable `data-tour="…"` attributes on the sidebar controls
 * (plus a couple of structural ids). Any step whose target is missing from the
 * DOM degrades to a centred popover, so the tour never breaks if a control is
 * hidden (e.g. the legend before the first isochrone has been computed).
 */
import type { DriveStep } from 'driver.js';
import type { TourDictionary } from '../i18n/types';

export function buildTourSteps(tour: TourDictionary): DriveStep[] {
  const s = tour.steps;
  const step = (text: { title: string; body: string }): DriveStep['popover'] => ({
    title: text.title,
    description: text.body,
  });

  return [
    // 1 — Welcome (centred, no anchor).
    { popover: { ...step(s.welcome), align: 'center' } },

    // 2 — Origin search.
    {
      element: '[data-tour="origin"]',
      popover: { ...step(s.origin), side: 'right', align: 'start' },
    },

    // 3 — Service day.
    {
      element: '[data-tour="date"]',
      popover: { ...step(s.date), side: 'right', align: 'start' },
    },

    // 4 — Departure time.
    {
      element: '[data-tour="time"]',
      popover: { ...step(s.time), side: 'right', align: 'start' },
    },

    // 5 — Max travel-time budget.
    {
      element: '[data-tour="duration"]',
      popover: { ...step(s.duration), side: 'right', align: 'start' },
    },

    // 6 — Max transfers.
    {
      element: '[data-tour="transfers"]',
      popover: { ...step(s.transfers), side: 'right', align: 'start' },
    },

    // 7 — Colour metric.
    {
      element: '[data-tour="metric"]',
      popover: { ...step(s.metric), side: 'right', align: 'start' },
    },

    // 8 — Hexagon resolution.
    {
      element: '[data-tour="resolution"]',
      popover: { ...step(s.resolution), side: 'right', align: 'start' },
    },

    // 9 — Transport modes.
    {
      element: '[data-tour="modes"]',
      popover: { ...step(s.modes), side: 'right', align: 'start' },
    },

    // 10 — The map: reachable area, legend, click-a-station-for-a-journey.
    {
      element: '#map',
      popover: { ...step(s.map), side: 'left', align: 'center' },
    },

    // 11 — Status-bar actions: share, info, language.
    {
      element: '[data-tour="actions"]',
      popover: { ...step(s.actions), side: 'top', align: 'end' },
    },

    // 12 — Replay button: how to reopen this tour later.
    {
      element: '[data-tour="replay"]',
      popover: { ...step(s.replayStep), side: 'top', align: 'end' },
    },
  ];
}
