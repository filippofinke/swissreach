/**
 * Date selection using Lyne's datepicker. The picker is constrained to the
 * available service-day window via `min`/`max` on `sbb-date-input`.
 */
import { SbbDateInput } from '@sbb-esta/lyne-react/date-input';
import { SbbDatepicker, SbbDatepickerToggle } from '@sbb-esta/lyne-react/datepicker';
import { SbbFormField } from '@sbb-esta/lyne-react/form-field';
import { useMemo } from 'react';
import { useTranslation } from '../i18n/I18nProvider';

export type DateFieldProps = {
  value: string; // YYYY-MM-DD
  availableDates: string[]; // sorted ascending
  onChange: (date: string) => void;
};

function parseIso(iso: string | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function formatIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DateField({ value, availableDates, onChange }: DateFieldProps) {
  const { t } = useTranslation();
  const min = useMemo(() => parseIso(availableDates[0]), [availableDates]);
  const max = useMemo(() => parseIso(availableDates[availableDates.length - 1]), [availableDates]);

  return (
    <div className="field">
      <span className="field-label">{t.date}</span>
      <SbbFormField size="m">
        <SbbDateInput
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const target = e.target as unknown as { valueAsDate: Date | null; value: string };
            const d = target.valueAsDate;
            const v = d ? formatIso(d) : target.value;
            if (v && v !== value) onChange(v);
          }}
        />
        <SbbDatepickerToggle />
        <SbbDatepicker />
      </SbbFormField>
    </div>
  );
}
