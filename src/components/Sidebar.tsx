/**
 * Sidebar panel: stacks the search field, date/time pickers, the duration
 * and transfers controls, the inline display controls, and the transport-
 * mode accordion. The bottom strip holds the status text + share + about
 * buttons.
 */
import { SbbIcon } from '@sbb-esta/lyne-react/icon';
import type { ReactNode } from 'react';
import type { StatePatch } from '../hooks/useAppState';
import type { RouterClient } from '../router-client';
import type { AppState, RouteType } from '../state/types';
import { DateField } from './DateField';
import { DisplayPanel } from './DisplayPanel';
import { MaxDurationField } from './MaxDurationField';
import { ModesPanel } from './ModesPanel';
import { OriginSearch } from './OriginSearch';
import { TimeField } from './TimeField';
import { TransfersField } from './TransfersField';

export type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  state: AppState;
  patch: (partial: StatePatch) => void;
  client: RouterClient;
  originName: string;
  availableDates: string[];
  availableModes: RouteType[];
  bottom: ReactNode;
};

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  state,
  patch,
  client,
  originName,
  availableDates,
  availableModes,
  bottom,
}: SidebarProps) {
  return (
    <aside id="panel" className={collapsed ? 'collapsed' : ''}>
      <button
        type="button"
        id="sidebar-toggle"
        className="sidebar-toggle-btn"
        aria-label="Toggle settings"
        title="Toggle settings"
        onClick={onToggleCollapsed}
      >
        <SbbIcon name="chevron-small-left-small" />
      </button>

      <div className="panel-scroll">
        <OriginSearch
          client={client}
          currentName={originName}
          onPick={(hit) => {
            if (hit.sourceId) patch({ origin: hit.sourceId });
          }}
        />

        <DateField
          value={state.date}
          availableDates={availableDates}
          onChange={(date) => patch({ date })}
        />
        <TimeField value={state.departure} onChange={(departure) => patch({ departure })} />

        <MaxDurationField
          value={state.maxDuration}
          onChange={(maxDuration) => patch({ maxDuration })}
        />

        <TransfersField
          value={state.maxTransfers}
          onChange={(maxTransfers) => patch({ maxTransfers })}
        />

        <DisplayPanel metric={state.metric} resolution={state.resolution} onChange={patch} />
        <ModesPanel
          available={availableModes}
          selected={state.modes}
          onChange={(update) => patch((prev) => ({ modes: update(prev.modes) }))}
        />
      </div>

      <div className="panel-bottom">{bottom}</div>
    </aside>
  );
}
