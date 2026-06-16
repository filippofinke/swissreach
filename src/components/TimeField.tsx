/**
 * Departure-time picker using Lyne's sbb-time-input.
 * Uses Lyne form-field so styling matches the date input next to it.
 */
import { SbbFormField } from '@sbb-esta/lyne-react/form-field';
import { SbbIcon } from '@sbb-esta/lyne-react/icon';
import { SbbTimeInput } from '@sbb-esta/lyne-react/time-input';
import { formatTime } from '../state/state';
import { useTranslation } from '../i18n/I18nProvider';

export type TimeFieldProps = {
  value: number; // minutes from midnight
  onChange: (departure: number) => void;
};

export function TimeField({ value, onChange }: TimeFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <span className="field-label">{t.departure}</span>
      <SbbFormField size="m">
        <SbbTimeInput
          value={formatTime(value)}
          onChange={(e) => {
            const target = e.target as unknown as { valueAsDate: Date | null };
            const d = target.valueAsDate;
            if (d) {
              const minutes = d.getHours() * 60 + d.getMinutes();
              if (minutes !== value) {
                onChange(minutes);
              }
            }
          }}
        />
        <SbbIcon slot="suffix" name="clock-small" />
      </SbbFormField>
    </div>
  );
}
