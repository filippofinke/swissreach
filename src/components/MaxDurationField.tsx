/**
 * Maximum travel-time field: a row of preset chip buttons (30/45/60/90/...
 * minutes) plus an inline custom-value input for arbitrary durations.
 */

import { useTranslation } from '../i18n/I18nProvider';

const PRESETS = [30, 45, 60, 90, 120];

export type MaxDurationFieldProps = {
  value: number;
  onChange: (minutes: number) => void;
};

function clamp(n: number): number {
  return Math.max(5, Math.min(600, n));
}

export function MaxDurationField({ value, onChange }: MaxDurationFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field" data-tour="duration">
      <span className="field-label">
        {t.within} <b>{value} {t.min}</b>
      </span>
      <fieldset className="chip-group" aria-label={t.maxDuration}>
        {PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            className={`chip-btn${v === value ? ' active' : ''}`}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
        <input
          type="number"
          min={5}
          max={600}
          step={5}
          inputMode="numeric"
          className="chip-input"
          placeholder={t.min}
          aria-label={t.maxDuration}
          defaultValue={PRESETS.includes(value) ? '' : value}
          onBlur={(e) => {
            const v = clamp(parseInt(e.currentTarget.value, 10));
            if (Number.isFinite(v) && v !== value) onChange(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
          }}
        />
      </fieldset>
    </div>
  );
}
