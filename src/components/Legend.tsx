/**
 * Overlay legend showing the colour scale for the active metric (travel time
 * or number of transfers). Positioned in the corner of the map.
 */
import { legendEntries } from '../map/colors';
import type { AppState } from '../state/types';
import { useTranslation } from '../i18n/I18nProvider';

export type LegendProps = {
  metric: AppState['metric'];
  maxDuration: number;
  maxTransfers: number;
};

export function Legend({ metric, maxDuration, maxTransfers }: LegendProps) {
  const { t } = useTranslation();
  const entries = legendEntries(metric, maxDuration, maxTransfers);
  return (
    <div className="legend-overlay">
      <div className="legend-scale">
        {entries.map((e) =>
          metric === 'time' ? (
            // Split the unit into its own span so the compact mobile legend can
            // hide the repeated "min" and keep it only on the last tick.
            <div key={`${e.label}-${e.value}`} className="legend-item">
              <span className="swatch" style={{ background: e.color }} />
              {e.value}
              <span className="legend-unit">&nbsp;{t.min}</span>
            </div>
          ) : (
            <div key={`${e.label}-${e.value}`} className="legend-item">
              <span className="swatch" style={{ background: e.color }} />
              {e.label.replace('min', t.min)}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
