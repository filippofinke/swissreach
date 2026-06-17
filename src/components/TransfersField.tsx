/**
 * Maximum-changes selector: a segmented pill with Direct / 1 / 2 / 3 / Any.
 * "Any" maps to a high transfer ceiling (8). `sbb-toggle` only supports two
 * options, so a plain SBB-styled segmented control is used instead.
 */
import type { CSSProperties } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import type { Dictionary } from '../i18n/types';

type Option = { labelKey: keyof Dictionary | string; value: number };

const OPTIONS: Option[] = [
  { labelKey: 'direct', value: 0 },
  { labelKey: '1', value: 1 },
  { labelKey: '2', value: 2 },
  { labelKey: '3', value: 3 },
  { labelKey: 'unlimited', value: 8 },
];

export type TransfersFieldProps = {
  value: number;
  onChange: (transfers: number) => void;
};

function isActive(optionValue: number, current: number): boolean {
  if (optionValue === 8) return current >= 4;
  return optionValue === current;
}

export function TransfersField({ value, onChange }: TransfersFieldProps) {
  const { t } = useTranslation();
  const activeIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => isActive(o.value, value)),
  );
  return (
    <div className="field" data-tour="transfers">
      <span className="field-label">{t.maxTransfers}</span>
      <fieldset
        className="seg-group"
        aria-label={t.maxTransfers}
        style={
          {
            '--seg-count': OPTIONS.length,
            '--seg-active': activeIndex,
          } as CSSProperties
        }
      >
        <span className="seg-indicator" aria-hidden="true" />
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`seg-btn${isActive(o.value, value) ? ' active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {['1', '2', '3'].includes(o.labelKey as string) ? o.labelKey : t[o.labelKey as keyof Dictionary] as string}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
