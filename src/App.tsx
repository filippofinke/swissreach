/**
 * Root composition: wires the router worker, the map, the sidebar, the
 * journey panel and the about dialog. Owns the cross-cutting state that
 * needs to live outside any single child.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AboutDialog } from './components/AboutDialog';
import { JourneyPanel } from './components/JourneyPanel';
import { Legend } from './components/Legend';
import { MapView, type MapViewHandle } from './components/MapView';
import { OriginMarker } from './components/OriginMarker';
import { Sidebar } from './components/Sidebar';
import { Stations } from './components/Stations';
import { StatusBar } from './components/StatusBar';
import { Surface } from './components/Surface';
import { useAppState } from './hooks/useAppState';
import { inApproxSwissBounds, useGeolocation } from './hooks/useGeolocation';
import { useIsochrone } from './hooks/useIsochrone';
import { useJourney } from './hooks/useJourney';
import { useRouterClient } from './hooks/useRouterClient';
import { useTranslation } from './i18n/I18nProvider';
import { ALL_MODES } from './state/types';

const BASE = import.meta.env.BASE_URL;
const BERN = { lat: 46.9489, lon: 7.4392, zoom: 9 };

export function App() {
  const router = useRouterClient(BASE);
  const meta = router.kind === 'ready' ? router.meta : null;
  const defaultOrigin = meta?.defaultOrigin ?? 'Parent8507000';

  const { state, patch, replace } = useAppState(defaultOrigin);
  const mapRef = useRef<MapViewHandle | null>(null);
  const collapsedRef = useRef<boolean>(window.matchMedia('(max-width: 760px)').matches);
  const [collapsed, setCollapsed] = useState(collapsedRef.current);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { t } = useTranslation();

  // Snap state.date into the available service-day window once the meta
  // arrives, and adopt the meta-provided default origin if the URL had none.
  useEffect(() => {
    if (router.kind !== 'ready' || !meta) return;
    const dates = meta.dates ?? [];
    const defaultDate = meta.defaultDate ?? dates[0] ?? state.date;
    if (dates.length && !dates.includes(state.date)) {
      replace({ ...state, date: defaultDate });
    }
  }, [router.kind, meta, replace, state]);

  // Try to centre on the user's location (if in Switzerland) when no origin
  // was specified in the URL. Snapshot the initial URL once — `useAppState`
  // mirrors state back to the query string on mount, which would otherwise
  // flip this flag to false before the geolocation result arrives.
  const initialUrlHadOrigin = useRef(new URLSearchParams(location.search).has('origin'));
  const wantLocate = router.kind === 'ready' && !initialUrlHadOrigin.current;
  const geo = useGeolocation(wantLocate);
  const locatedRef = useRef(false);
  useEffect(() => {
    if (locatedRef.current || !wantLocate || router.kind !== 'ready') return;
    if (!geo.resolved) return;
    locatedRef.current = true;
    const here = geo.position;
    if (!here || !inApproxSwissBounds(here.lat, here.lon)) return;
    router.client
      .nearest(here.lat, here.lon)
      .then((near) => {
        if (near) {
          patch({ origin: near.sourceId });
          mapRef.current?.flyTo(near.lon, near.lat);
        }
      })
      .catch(() => {});
  }, [geo.resolved, geo.position, wantLocate, router, patch]);

  // Drive the worker for the current state.
  const iso = useIsochrone(
    router.kind === 'ready' ? router.client : null,
    state,
    router.kind === 'ready',
  );
  const points = iso.kind === 'ok' ? iso.result.points : [];
  const origin = iso.kind === 'ok' ? iso.result.origin : null;

  // Journey panel.
  const journey = useJourney(router.kind === 'ready' ? router.client : null);
  const [anchor, setAnchor] = useState<{ lon: number; lat: number } | null>(null);
  const [anchorPx, setAnchorPx] = useState<{ x: number; y: number } | null>(null);

  // Recompute anchor pixel position whenever the map viewport changes or the
  // anchor lng/lat itself moves.
  const reprojectAnchor = useCallback(() => {
    if (!anchor) {
      setAnchorPx(null);
      return;
    }
    const px = mapRef.current?.project(anchor.lon, anchor.lat);
    setAnchorPx(px ?? null);
  }, [anchor]);

  useEffect(() => {
    reprojectAnchor();
  }, [reprojectAnchor]);

  // Fly to a new origin once it is known.
  const lastOriginIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!origin) return;
    if (lastOriginIdRef.current === state.origin) return;
    lastOriginIdRef.current = state.origin;
    mapRef.current?.flyTo(origin.lon, origin.lat);
  }, [origin, state.origin]);

  // Hide journey panel whenever a new isochrone starts loading.
  useEffect(() => {
    if (iso.kind === 'loading') {
      journey.close();
      setAnchor(null);
    }
  }, [iso.kind, journey]);

  // Map click → nearest station → journey.
  const onMapClick = useCallback(
    (lon: number, lat: number) => {
      if (router.kind !== 'ready') return;
      router.client.nearest(lat, lon).then((near) => {
        if (!near || near.sourceId === state.origin) return;
        setAnchor({ lon: near.lon, lat: near.lat });
        journey.fetchJourney({ sourceId: near.sourceId, name: near.name });
      });
    },
    [router, state.origin, journey],
  );

  const onStationClick = useCallback(
    (sourceId: string, name: string, lon: number, lat: number) => {
      if (sourceId === state.origin) return;
      setAnchor({ lon, lat });
      journey.fetchJourney({ sourceId, name });
    },
    [state.origin, journey],
  );

  const onJourneyClose = useCallback(() => {
    journey.close();
    setAnchor(null);
  }, [journey]);

  const onSetOrigin = useCallback(
    (sourceId: string) => {
      patch({ origin: sourceId });
      journey.close();
      setAnchor(null);
    },
    [patch, journey],
  );

  function share(): void {
    const url = location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => setStatusMessage(t.linkCopied),
        () => setStatusMessage(url),
      );
    } else {
      setStatusMessage(url);
    }
  }

  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  function setStatusMessage(msg: string) {
    setStatusOverride(msg);
    window.setTimeout(() => setStatusOverride(null), 4000);
  }

  const status = useMemo(() => {
    if (statusOverride) return { text: statusOverride, busy: false };
    if (router.kind === 'loading') return { text: t.loading, busy: true };
    if (router.kind === 'error')
      return { text: t.loadingDataError, busy: false };
    if (iso.kind === 'loading') return { text: t.computingIsochrone, busy: true };
    if (iso.kind === 'empty') {
      const reason = iso.reason;
      return {
        text:
          reason === 'no-data'
            ? t.noDataError
            : t.originNotFoundError,
        busy: false,
      };
    }
    if (iso.kind === 'ok') {
      return {
        text: `${t.stationsReachable(iso.result.points.length)} · ${t.timeMs(iso.result.elapsedMs)}`,
        busy: false,
      };
    }
    if (iso.kind === 'error') return { text: t.routingFailedError, busy: false };
    return { text: '', busy: false };
  }, [router, iso, statusOverride, t]);

  const availableDates = meta?.dates ?? [];
  const availableModes = meta?.modes?.length ? meta.modes : [...ALL_MODES];

  const journeyContext = {
    fromName: origin?.name ?? '',
    date: state.date,
    departure: state.departure,
  };

  return (
    <div id="app" className={collapsed ? 'sidebar-collapsed' : ''}>
      {router.kind === 'ready' && (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          state={state}
          patch={patch}
          client={router.client}
          originName={origin?.name ?? ''}
          availableDates={availableDates}
          availableModes={availableModes}
          bottom={
            <StatusBar
              status={status.text}
              busy={status.busy}
              onShare={share}
              onAbout={() => setAboutOpen(true)}
            />
          }
        />
      )}

      <main id="map">
        <MapView
          ref={mapRef}
          initialCenter={{ lon: BERN.lon, lat: BERN.lat, zoom: BERN.zoom }}
          onMapClick={onMapClick}
          onViewportChange={reprojectAnchor}
        >
          {points.length > 0 && (
            <Surface
              points={points}
              metric={state.metric}
              maxDuration={state.maxDuration}
              resolution={state.resolution}
            />
          )}
          {points.length > 0 && (
            <Stations
              points={points}
              metric={state.metric}
              maxDuration={state.maxDuration}
              onStationClick={onStationClick}
            />
          )}
          {origin && <OriginMarker lon={origin.lon} lat={origin.lat} name={origin.name} />}
        </MapView>
        {points.length > 0 && (
          <Legend
            metric={state.metric}
            maxDuration={state.maxDuration}
            maxTransfers={state.maxTransfers}
          />
        )}
        <JourneyPanel
          status={journey.status}
          context={journeyContext}
          anchorPx={anchorPx}
          containerSize={() => mapRef.current?.containerSize() ?? null}
          onClose={onJourneyClose}
          onSetOrigin={onSetOrigin}
        />
      </main>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
