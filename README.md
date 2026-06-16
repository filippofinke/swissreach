# SwissReach

[![Deploy](https://github.com/filippofinke/swissreach/actions/workflows/deploy.yml/badge.svg)](https://github.com/filippofinke/swissreach/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://filippofinke.github.io/swissreach/)

**SwissReach** is an open-source reachability map for Swiss public transport, with a UI styled after the **SBB Mobile** app. It answers a simple question: **how far can you get by public transport from a station in a given amount of time?** All routing happens **entirely in your browser** — there is no backend. The transit timetable for a day is loaded into memory and queried in real time with the **RAPTOR** algorithm via [`minotor`](https://github.com/aubryio/minotor).

> I built this while relocating — I wanted to pick a new place to live based not just on the location itself, but on **where I could actually get to by public transport** from it. Searching one connection at a time on SBB Mobile didn't scale, so this map shows every reachable station at once for a given commute budget.

> The interface follows the look & feel of SBB Mobile (red top bar, white rounded cards, segmented pill toggles, SBB-style product badges) and uses the official [SBB Lyne design tokens](https://digital.sbb.ch/en/design-system/lyne/overview/). This is an independent homage and is **not affiliated with or endorsed by SBB**.

## Features

- **Origin search** — station-name autocomplete (accent-aware).
- **Auto-locate** — on first load (no `origin` in the URL) the app asks for the browser location and centers the isochrone on the nearest station if you're in Switzerland.
- **Journey details** — click any reachable station to see the full itinerary (which trains/buses to board, where to change, at what times). The same panel offers a "use as origin" shortcut.
- **Click empty map** — re-center the isochrone on the nearest station.
- **Departure time and date selectors** — bounded to the available timetable window.
- **Transport-mode filter** — train, bus, tram, subway, ferry, cable car, funicular, trolleybus, monorail, aerial lift.
- **Sliders** — max travel time (15–300 min) and max number of changes (0–8).
- **Colour by travel time _or_ number of changes**.
- **H3 hexagon surface** — adjustable resolution (5–9).
- **i18n** — UI available in DE / EN / FR / IT / RM (Romansh), auto-detected from the browser.
- **Shareable URLs** — every control is encoded in the query string, with a one-click "copy link" button.
- **Fast** — a full-network isochrone computes in a few milliseconds in a Web Worker.

## How it works

```
GTFS feed ──(Node, build time)──▶ minotor protobuf binaries ──▶ browser
  stops.txt / stop_times.txt        timetable.bin (timetable)      │
  trips.txt / routes.txt            stops.bin     (stops index)    ▼
  calendar.txt                                              Web Worker
                                                          ┌───────────────┐
                                                          │  minotor      │
   UI controls ──▶ IsochroneParams ──────────────────────▶│  Range-RAPTOR │
                                                          │  full network │
   H3 hexagons ◀── reachable stations ◀───────────────────┴───────────────┘
                 │
                 ▼
            MapLibre GL
```

- **[minotor](https://github.com/aubryio/minotor)** (MIT, by Aubry Cholleton) — client-side RAPTOR router. Parses GTFS into a compact protobuf format and computes the earliest arrival to **every** reachable stop in one pass.
- **[MapLibre GL JS](https://maplibre.org/)** (via [react-map-gl](https://visgl.github.io/react-map-gl/)) — renders the map and the isochrone surface.
- **[h3-js](https://github.com/uber/h3-js)** — bins reachable stations into hexagons.
- **[React 19](https://react.dev/)** + **[Vite](https://vitejs.dev/)** — UI shell and build tooling.
- **[@sbb-esta/lyne-react](https://digital.sbb.ch/en/design-system/lyne/overview/)** — official SBB Lyne web components.

Routing runs in a Web Worker (`src/worker/router.worker.ts`) so the UI stays responsive. Changing a *visual* option (colour metric, hexagon resolution) re-renders instantly from the cached result; changing a *routing* option (origin, time, modes, limits) triggers a fresh RAPTOR query.

## Prerequisites

- **Node** `>=24.11` (minotor's GTFS parser requires it).
- **npm** (bundled with Node).

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/filippofinke/swissreach.git
cd swissreach
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate transit data

The app needs `public/data/stops.bin`, one or more content-hashed `timetable_<hash>.bin` files (one per unique service day), and a `meta.json` index. They are committed so the app runs out of the box, but can be regenerated at any time:

```bash
npm run data      # build the sample network (offline, ~347 stations)
npm run logo      # optional: download the SBB logo to public/
```

### 4. Run the dev server

```bash
npm run dev       # http://localhost:5173
```

### 5. Build a static site

```bash
npm run build     # outputs to dist/
npm run preview
```

## Transit data

### Sample network (default, offline)

`scripts/swiss-network.ts` defines a synthetic-but-realistic, **multimodal** model of the Swiss network: **~347 stations** across every region, connected by **~169 lines** covering **8 transport modes** — IC/IR/S-Bahn **trains**, city **trams** (Zürich, Bern, Basel, Genève) and the Lausanne **metro**, **trolleybuses**, **PostBus/regional buses** into the villages, lake **ferries** (Lucerne, Geneva, Zürich, Thun/Brienz, Constance) and mountain **cable cars / funiculars** (Rigi, Pilatus, Gornergrat, Schilthorn, Titlis, …). Travel times are derived from the great-circle distance between consecutive stops and a per-mode speed.

```bash
npm run data:sample   # build tmp-gtfs/sample-gtfs.zip from the network model
npm run data:build    # parse it into public/data/*.bin + meta.json
npm run data          # both of the above
```

### Real Swiss GTFS feed (every stop in the country)

To load the **real** national timetable from [opentransportdata.swiss](https://data.opentransportdata.swiss/en/dataset/timetable-2026-gtfs2020) — ~100,000 stops, including every bus stop, tram stop and ferry pier:

```bash
npm run data:real                  # download + build today only
DAYS=14 npm run data:real          # ...a 14-day rolling window
npm run data:real -- 2026-07-01    # ...starting from a specific day
npm run data:real:parallel         # build the window with a worker pool
npm run dev                        # now search any stop in Switzerland
```

Options (env vars): `DAYS=<n>` sets the planning window length (default 1; the GitHub Actions deploy sets 14), `WORKERS=<n>` sizes the parallel worker pool, `FRESH=1` forces a re-download, `GTFS_URL=<url>` overrides the source, `DEFAULT_ORIGIN=<sourceId>` / `FEED_NAME=<name>` customise `meta.json`.

### Planning ahead (multi-day window)

The build produces **one timetable per day** for a rolling window (configurable via `DAYS`), so trips on any day in the window route against that day's **holiday-aware** schedule. Identical days are deduplicated by content hash, and the browser **lazy-loads only the day you pick** (initial load is ~5 MB on the real feed). `meta.json` lists the available `dates` and maps each to its `timetable_<hash>.bin` file.

## URL parameters

| Param       | Example               | Meaning                                 |
| ----------- | --------------------- | --------------------------------------- |
| `origin`    | `Parent8507000`       | Origin station source id (Bern)         |
| `date`      | `2026-06-14`          | Service date                            |
| `dep`       | `08:00`               | Departure time                          |
| `max`       | `120`                 | Max travel time (minutes)               |
| `transfers` | `5`                   | Max number of changes                   |
| `modes`     | `RAIL,BUS,TRAM`       | Allowed transport modes (omitted = all) |
| `metric`    | `time`/`transfers`    | Colour scale                            |
| `res`       | `7`                   | H3 hexagon resolution (5–9)             |

## Project layout

```
scripts/
  swiss-network.ts          # the sample network model (stations + lines)
  make-sample-gtfs.ts       # network model  -> GTFS zip
  build-data.ts             # GTFS zip       -> minotor *.bin + meta.json
  build-data-parallel.ts    # ...same, with a worker pool over service days
  build-day-worker.ts       # per-day build worker (used by the parallel builds)
  build-real.ts             # one-shot: download real feed + build it
  build-real-parallel.ts    # ...same, with a worker pool over service days
  fetch-swiss-gtfs.ts       # download the real Swiss GTFS feed
  fetch-sbb-logo.ts         # download the SBB logo
src/
  App.tsx                   # top-level composition, cross-cutting state
  main.tsx                  # React entry point
  worker/router.worker.ts   # loads timetable, runs Range-RAPTOR isochrones
  router-client.ts          # promise-based main-thread worker client
  components/               # React components (Sidebar, MapView, JourneyPanel,
                            #   Surface, Stations, Legend, AboutDialog, ...)
  hooks/                    # useAppState, useRouterClient, useIsochrone,
                            #   useJourney, useGeolocation
  map/
    hexagons.ts             # H3 binning -> GeoJSON
    colors.ts               # colour scales + legend
    backgrounds.ts          # MapLibre basemap style
  state/
    state.ts                # URL <-> AppState
    types.ts                # AppState, IsochronePoint, Meta, RouteType, ...
  i18n/                     # I18nProvider + DE / EN / FR / IT / RM dictionaries
  styles.css                # global styles
public/data/                # generated timetable_<hash>.bin / stops.bin / meta.json
```

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site and publishes it to **GitHub Pages** on every push to `main` and on manual dispatch.

A full year of timetables is committed under `public/data/`, so the deploy serves up-to-date data without a recurring rebuild. The workflow still attempts to (re)build the real Swiss GTFS feed at deploy time and falls back to the bundled sample data if the feed is unavailable, so a deploy never breaks. If the feed ever needs a custom URL or token, set a `GTFS_URL` repository secret.

Enable Pages → "GitHub Actions" in the repository settings.

## Credits

- [minotor](https://github.com/aubryio/minotor) by **Aubry Cholleton** — the client-side RAPTOR routing engine this app is built on.
- Timetable data: the Swiss GTFS feed on [opentransportdata.swiss](https://opentransportdata.swiss).
- Basemap: © OpenStreetMap contributors, © CARTO (Carto Light tiles).

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

## Author

👤 **Filippo Finke**

- Website: https://filippofinke.ch
- Github: [@filippofinke](https://github.com/filippofinke)
- LinkedIn: [@filippofinke](https://linkedin.com/in/filippofinke)

## Show your support

Give a ⭐️ if this project helped you!

<a href="https://www.buymeacoffee.com/filippofinke">
  <img src="https://github.com/filippofinke/filippofinke/raw/main/images/buymeacoffe.png" alt="Buy Me A McFlurry">
</a>
