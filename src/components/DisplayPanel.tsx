/**
 * Display controls: metric (time vs. number of changes) and H3 hexagon
 * resolution. Rendered inline in the sidebar.
 */
import { SbbSlider } from '@sbb-esta/lyne-react/slider';
import type { CSSProperties } from 'react';
import type { AppState } from '../state/types';
import { useTranslation } from '../i18n/I18nProvider';

export type DisplayPanelProps = {
  metric: AppState['metric'];
  resolution: number;
  onChange: (partial: Partial<AppState>) => void;
};

export function DisplayPanel({ metric, resolution, onChange }: DisplayPanelProps) {
  const { t } = useTranslation();
  
  const METRICS: { value: AppState['metric']; label: string }[] = [
    { value: 'time', label: t.duration },
    { value: 'transfers', label: t.transfers },
  ];

  return (
    <>
      <div className="field" data-tour="metric">
        <span className="field-label">{t.colorBy}</span>
        <fieldset
          className="seg-group"
          aria-label={t.colorBy}
          style={
            {
              '--seg-count': METRICS.length,
              '--seg-active': Math.max(
                0,
                METRICS.findIndex((m) => m.value === metric),
              ),
            } as CSSProperties
          }
        >
          <span className="seg-indicator" aria-hidden="true" />
          {METRICS.map((m) => (
            <button
              key={m.value}
              type="button"
              className={`seg-btn${m.value === metric ? ' active' : ''}`}
              onClick={() => {
                if (m.value !== metric) onChange({ metric: m.value });
              }}
            >
              {m.label}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="field" data-tour="resolution">
        <span className="field-label">
          {t.resolution} <b>{resolution}</b>
        </span>
        <SbbSlider
          min="5"
          max="9"
          value={String(resolution)}
          onChange={(e) => {
            const v = +(e.target as HTMLInputElement).value;
            if (v !== resolution) onChange({ resolution: v });
          }}
        />
      </div>
    </>
  );
}
