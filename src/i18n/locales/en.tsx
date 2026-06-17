import { Dictionary } from '../types';

export const en: Dictionary = {
  about: 'About',
  aboutDescription:
    'shows how far you can travel by public transport from any station in a given time. Everything — the routing and the map — runs entirely in your browser; there is no backend.',
  howItsBuilt: "How it's built",
  howItsBuiltDescription: (
    <>
      Connections are computed client-side with the RAPTOR algorithm via{' '}
      <a href="https://github.com/aubryio/minotor" target="_blank" rel="noopener">
        minotor
      </a>
      , the map is rendered with{' '}
      <a href="https://maplibre.org" target="_blank" rel="noopener">
        MapLibre GL
      </a>
      , and the timetable comes from the open Swiss GTFS feed on{' '}
      <a href="https://opentransportdata.swiss" target="_blank" rel="noopener">
        opentransportdata.swiss
      </a>
      .
    </>
  ),
  createdBy: 'Created by',
  createdByDescription: (
    <>
      An open-source project by{' '}
      <a href="https://github.com/filippofinke" target="_blank" rel="noopener">
        Filippo Finke
      </a>
      . Source &amp; issues on{' '}
      <a href="https://github.com/filippofinke/swissreach" target="_blank" rel="noopener">
        GitHub
      </a>
      . Released under the MIT licence.
    </>
  ),
  design: 'Design',
  designDescription: (
    <>
      The interface is styled after the SBB Mobile app using SBB's open{' '}
      <a href="https://digital.sbb.ch/en/design-system/lyne/overview/" target="_blank" rel="noopener">
        Lyne design tokens
      </a>
      .
    </>
  ),
  disclaimer: (
    <>
      This is an independent, <b>unofficial</b> project. It is not affiliated with, endorsed by, or operated by SBB. “SBB” and the SBB logo are trademarks of Schweizerische Bundesbahnen SBB and appear here only to link to official SBB services.
    </>
  ),

  loading: 'Loading…',
  loadingDataError: 'Failed to load transit data. Did you run `npm run data`?',
  computingIsochrone: 'Computing isochrone…',
  noDataError: 'Timetable data unavailable for this day.',
  originNotFoundError: 'Origin not found in the timetable.',
  routingFailedError: 'Routing failed.',
  stationsReachable: (count: number) => `${count} stations`,
  timeMs: (ms: number) => `${Math.round(ms)} ms`,
  linkCopied: 'Link copied to clipboard',

  searchOriginPlaceholder: 'Search a station…',
  from: 'From',
  date: 'Date',
  departure: 'Departure',
  maxDuration: 'Max duration',
  within: 'Within',
  minutes: 'minutes',
  maxTransfers: 'Max transfers',
  direct: 'Direct',
  unlimited: 'Any',

  colorBy: 'Color by',
  duration: 'Duration',
  transfers: 'Transfers',
  resolution: 'Resolution',
  high: 'High',
  low: 'Low',

  transportModes: 'Transport modes',
  modes: {
    RAIL: 'Train',
    BUS: 'Bus',
    TRAM: 'Tram',
    SUBWAY: 'Metro',
    FERRY: 'Boat',
    CABLE_TRAM: 'Cable tram',
    AERIAL_LIFT: 'Cable car',
    FUNICULAR: 'Funicular',
    TROLLEYBUS: 'Trolleybus',
    MONORAIL: 'Monorail',
  },

  journeyFrom: 'Journey from',
  walkTo: 'Walk to',
  transferAt: 'Transfer at',
  makeNewOrigin: 'Set as new origin',
  journeyNotFound: 'No direct result — try SBB for options.',
  openInSbb: 'Open in SBB',
  findingConnection: 'Finding the best connection…',
  couldNotLoadConnection: 'Could not load the connection.',
  changes: (count: number) => `${count} change${count === 1 ? '' : 's'}`,
  walk: 'Walk',
  change: 'Change',

  min: 'min',

  language: 'Language',

  tour: {
    next: 'Next',
    back: 'Back',
    done: 'Done',
    progress: '{{current}} of {{total}}',
    replay: 'Replay the tour',
    steps: {
      welcome: {
        title: 'Welcome to SwissReach',
        body: 'See how far you can travel by public transport from any Swiss station. Everything runs in your browser. There is no backend. This quick tour points out every control. Use Next and Back, or close it anytime.',
      },
      origin: {
        title: 'Choose your starting point',
        body: 'Search for any station here. The map redraws to show everywhere you can reach from it.',
      },
      date: {
        title: 'Pick the day',
        body: 'Choose the service day to plan for. Only days with available timetable data can be selected.',
      },
      time: {
        title: 'Set the departure time',
        body: 'Travel times are calculated for journeys leaving around this time.',
      },
      duration: {
        title: 'Travel time budget',
        body: 'Show only places reachable within this many minutes. Tap a preset or type your own value.',
      },
      transfers: {
        title: 'Limit the changes',
        body: 'Allow only direct trips, or up to 1, 2 or 3 changes, or any number with “Any”.',
      },
      metric: {
        title: 'Colour the map',
        body: 'Shade the map by travel time, or by the number of changes needed to get there.',
      },
      resolution: {
        title: 'Map detail',
        body: 'Adjust how fine the hexagon grid is. Higher means more detail; lower is faster and smoother.',
      },
      modes: {
        title: 'Transport modes',
        body: 'Include or exclude trains, buses, trams, boats and more to see how the reachable area changes.',
      },
      map: {
        title: 'Your reachable area',
        body: 'Coloured hexagons show where you can get to, and the legend explains the colours. Click any station on the map for a step by step connection, and to set it as the new starting point.',
      },
      actions: {
        title: 'Share, info & language',
        body: 'Copy a link to your current view, open the about box, or switch the language here.',
      },
      replayStep: {
        title: 'Need the tour again?',
        body: 'Reopen this guided tour anytime from this button. Enjoy exploring Switzerland!',
      },
    },
  },
};
