/**
 * Journey panel: shows the reconstructed itinerary to a clicked station —
 * which lines to board, where to change, and at what times.
 */
import type { CSSProperties } from 'react';
import { SbbButtonLink, SbbSecondaryButton } from '@sbb-esta/lyne-react/button';
import { SbbIcon } from '@sbb-esta/lyne-react/icon';
import type { JourneyStatus } from '../hooks/useJourney';
import { formatTime } from '../state/state';
import type { Journey, RouteType } from '../state/types';
import { useTranslation } from '../i18n/I18nProvider';
import type { Dictionary } from '../i18n/types';



const MODE_ICON: Record<RouteType, string> = {
  RAIL: '🚆',
  BUS: '🚌',
  TRAM: '🚊',
  SUBWAY: '🚇',
  FERRY: '⛴️',
  CABLE_TRAM: '🚋',
  AERIAL_LIFT: '🚠',
  FUNICULAR: '🚞',
  TROLLEYBUS: '🚎',
  MONORAIL: '🚝',
};

const RAIL_EXPRESS = /^(ICE|EC|IC|IR|RE|RJX|TGV|EN|NJ|PE|EXT)\b/i;

function formatLineName(line: string, mode: RouteType, t: Dictionary): string {
  const label = t.modes[mode];
  const trimmed = line.trim();
  if (!label) return trimmed;
  if (trimmed.toLowerCase().startsWith(label.toLowerCase())) return trimmed;
  return `${label} ${trimmed}`;
}

function lineBadge(line: string, mode: RouteType): { text: string; cls: string } {
  const firstToken = line.trim().split(/\s+/)[0] ?? line;
  const num = (line.match(/\d+/) ?? [''])[0];
  switch (mode) {
    case 'RAIL': {
      if (RAIL_EXPRESS.test(firstToken)) return { text: firstToken.toUpperCase(), cls: 'ic' };
      if (/^S\d/i.test(firstToken) || /^S$/i.test(firstToken))
        return { text: num ? `S${num}` : 'S', cls: 's' };
      return {
        text: /^R/i.test(firstToken) && firstToken.length <= 3 ? firstToken.toUpperCase() : 'R',
        cls: 'r',
      };
    }
    case 'SUBWAY':
      return { text: num ? `m${num}` : 'M', cls: 'ic' };
    case 'TRAM':
      return { text: num || '🚊', cls: 'tram' };
    case 'BUS':
      return { text: num || '🚌', cls: 'bus' };
    case 'TROLLEYBUS':
      return { text: num || '🚎', cls: 'trolley' };
    case 'FERRY':
      return { text: '⛴', cls: 'ferry' };
    case 'FUNICULAR':
    case 'AERIAL_LIFT':
    case 'CABLE_TRAM':
      return { text: MODE_ICON[mode], cls: 'mtn' };
    default:
      return { text: firstToken.toUpperCase(), cls: 'r' };
  }
}

function sbbDeepLink(fromName: string, destName: string, date: string, departMin: number): string {
  const stops = `${fromName}~${destName}`;
  const time = formatTime(departMin).replace(':', '_');
  return (
    `https://www.sbb.ch/en?stops=${encodeURIComponent(stops)}` +
    `&day=${encodeURIComponent(date)}&time=${time}&moment=dep`
  );
}

export type JourneyContext = {
  fromName: string;
  date: string;
  departure: number;
};

export type JourneyPanelProps = {
  status: JourneyStatus;
  context: JourneyContext;
  anchorPx?: { x: number; y: number } | null;
  containerSize?: () => { width: number; height: number } | null;
  onClose: () => void;
  onSetOrigin: (sourceId: string) => void;
};

const PANEL_W = 360;
const ANCHOR_OFFSET = 18;
const EDGE_MARGIN = 12;

function anchorStyle(
  anchorPx: { x: number; y: number } | null | undefined,
  containerSize: (() => { width: number; height: number } | null) | undefined,
): CSSProperties | undefined {
  if (!anchorPx) return undefined;
  const size = containerSize?.() ?? { width: window.innerWidth, height: window.innerHeight };
  const panelW = Math.min(PANEL_W, size.width - EDGE_MARGIN * 2);
  // Prefer placing to the right of the station; flip left if it would overflow.
  let left = anchorPx.x + ANCHOR_OFFSET;
  if (left + panelW + EDGE_MARGIN > size.width) {
    left = anchorPx.x - ANCHOR_OFFSET - panelW;
  }
  left = Math.max(EDGE_MARGIN, Math.min(left, size.width - panelW - EDGE_MARGIN));
  // Vertically center on the station; clamp inside the map container.
  const approxH = 280;
  let top = anchorPx.y - approxH / 2;
  top = Math.max(EDGE_MARGIN, Math.min(top, size.height - approxH - EDGE_MARGIN));
  const maxHeight = size.height - top - EDGE_MARGIN;
  return { left, top, right: 'auto', width: panelW, maxHeight };
}

function Header({ title, sub, onClose }: { title: string; sub: string; onClose: () => void }) {
  return (
    <div className="journey-head">
      <div>
        <div className="journey-title">{title}</div>
        <div className="journey-sub">{sub}</div>
      </div>
      <button type="button" className="journey-close" aria-label="Close" onClick={onClose}>
        <SbbIcon name="cross-small" />
      </button>
    </div>
  );
}

function Actions({
  fromName,
  destName,
  date,
  departMin,
  onSetOrigin,
}: {
  fromName: string;
  destName: string;
  date: string;
  departMin: number;
  onSetOrigin: () => void;
}) {
  const { t } = useTranslation();
  const href = sbbDeepLink(fromName, destName, date, departMin);
  return (
    <div className="journey-actions">
      <SbbButtonLink
        href={href}
        target="_blank"
        rel="noopener"
        title="Open this trip on sbb.ch"
        size="m"
      >
        <span>{t.openInSbb}</span>
      </SbbButtonLink>
      <SbbSecondaryButton size="m" onClick={onSetOrigin}>
        {t.makeNewOrigin}
      </SbbSecondaryButton>
    </div>
  );
}

export function JourneyPanel({
  status,
  context,
  anchorPx,
  containerSize,
  onClose,
  onSetOrigin,
}: JourneyPanelProps) {
  const { t } = useTranslation();
  if (status.kind === 'closed') return null;
  const target = status.target;
  const style = anchorStyle(anchorPx, containerSize);
  const cls = `journey-panel${anchorPx ? ' journey-panel--anchored' : ''}`;

  if (status.kind === 'loading') {
    return (
      <div className={cls} style={style}>
        <Header title={target.name} sub={t.findingConnection} onClose={onClose} />
      </div>
    );
  }

  if (status.kind === 'error') {
    return (
      <div className={cls} style={style}>
        <Header title={target.name} sub={t.couldNotLoadConnection || 'Could not load the connection.'} onClose={onClose} />
      </div>
    );
  }

  const journey: Journey = status.journey;

  if (!journey.found) {
    return (
      <div className={cls} style={style}>
        <Header
          title={journey.destName || target.name || 'Station'}
          sub={t.journeyNotFound}
          onClose={onClose}
        />
        <Actions
          fromName={context.fromName}
          destName={target.name}
          date={context.date}
          departMin={context.departure}
          onSetOrigin={() => onSetOrigin(target.sourceId)}
        />
      </div>
    );
  }

  const sub =
    `${formatTime(journey.departure)} → ${formatTime(journey.arrival)} · ` +
    `${journey.duration} ${t.min} · ${t.changes(journey.transfers)}`;

  return (
    <div className={cls} style={style}>
      <Header title={journey.destName} sub={sub} onClose={onClose} />
      <ol className="journey-legs">
        {journey.legs.map((leg, i) => {
          if (leg.kind === 'vehicle') {
            const badge = lineBadge(leg.line, leg.mode);
            const key = `${i}-${leg.kind}-${leg.line}-${leg.departure}`;
            return (
              <li key={key} className="leg vehicle">
                <div className="leg-time">{formatTime(leg.departure)}</div>
                <div className="leg-body">
                  <div className="leg-from">{leg.fromName}</div>
                  <div className="leg-line">
                    <span className={`sbb-badge sbb-badge--${badge.cls}`}>{badge.text}</span>
                    <span className="leg-mode">{formatLineName(leg.line, leg.mode, t)}</span>
                  </div>
                  <div className="leg-to">
                    {formatTime(leg.arrival)} · {leg.toName}
                  </div>
                </div>
              </li>
            );
          }
          const verb = leg.kind === 'transfer' ? t.change : t.walk;
          const key = `${i}-${leg.kind}-${leg.fromName}-${leg.toName}`;
          return (
            <li key={key} className="leg walk">
              <div className="leg-time"></div>
              <div className="leg-body">
                <div className="leg-walk">
                  {verb} · {leg.minutes} {t.min}
                  {leg.fromName !== leg.toName ? ` → ${leg.toName}` : ''}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <Actions
        fromName={context.fromName}
        destName={journey.destName}
        date={context.date}
        departMin={journey.departure}
        onSetOrigin={() => onSetOrigin(target.sourceId)}
      />
    </div>
  );
}
