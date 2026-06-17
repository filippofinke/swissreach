import type { RouteType } from '../state/types';

/** Title + body for a single guided-tour step. */
export type TourStepText = { title: string; body: string };

/** Strings for the first-launch guided tour (driver.js). */
export type TourDictionary = {
  next: string;
  back: string;
  done: string;
  /** Progress template; supports driver.js's {{current}}/{{total}} tokens. */
  progress: string;
  /** Label for the replay (?) button in the status bar. */
  replay: string;
  steps: {
    welcome: TourStepText;
    origin: TourStepText;
    date: TourStepText;
    time: TourStepText;
    duration: TourStepText;
    transfers: TourStepText;
    metric: TourStepText;
    resolution: TourStepText;
    modes: TourStepText;
    map: TourStepText;
    actions: TourStepText;
    replayStep: TourStepText;
  };
};

export type Dictionary = {
  // About Dialog
  about: string;
  aboutDescription: string;
  howItsBuilt: string;
  howItsBuiltDescription: React.ReactNode;
  createdBy: string;
  createdByDescription: React.ReactNode;
  design: string;
  designDescription: React.ReactNode;
  disclaimer: React.ReactNode;

  // App & Status
  loading: string;
  loadingDataError: string;
  computingIsochrone: string;
  noDataError: string;
  originNotFoundError: string;
  routingFailedError: string;
  stationsReachable: (count: number) => string;
  timeMs: (ms: number) => string;
  linkCopied: string;

  // Sidebar & Inputs
  searchOriginPlaceholder: string;
  from: string;
  date: string;
  departure: string;
  maxDuration: string;
  within: string;
  minutes: string;
  maxTransfers: string;
  direct: string;
  unlimited: string;

  // Display Panel
  colorBy: string;
  duration: string;
  transfers: string;
  resolution: string;
  high: string;
  low: string;

  // Modes Panel
  transportModes: string;
  modes: Record<RouteType, string>;

  // Journey Panel
  journeyFrom: string;
  walkTo: string;
  transferAt: string;
  makeNewOrigin: string;
  journeyNotFound: string;
  openInSbb: string;
  findingConnection: string;
  couldNotLoadConnection: string;
  changes: (count: number) => string;
  walk: string;
  change: string;

  // Legend
  min: string;

  // General
  language: string;

  // Guided tour
  tour: TourDictionary;
};

export type Language = 'en' | 'it' | 'de' | 'fr' | 'rm';
