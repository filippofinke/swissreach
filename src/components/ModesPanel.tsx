/**
 * Transport-mode filter — inline (no accordion). Each available mode is an
 * SBB checkbox; ticking/unticking adds or removes it from the routing set.
 */
import { SbbCheckbox } from '@sbb-esta/lyne-react/checkbox';
import { SbbCheckboxGroup } from '@sbb-esta/lyne-react/checkbox-group';
import type { RouteType } from '../state/types';
import { useTranslation } from '../i18n/I18nProvider';

export type ModesPanelProps = {
  available: RouteType[];
  selected: RouteType[];
  /**
   * Receives an updater that derives the next selection from the *latest*
   * modes rather than the render-time snapshot, so quick successive toggles
   * each build on the previous one instead of reverting it.
   */
  onChange: (update: (current: RouteType[]) => RouteType[]) => void;
};

export function ModesPanel({ available, selected, onChange }: ModesPanelProps) {
  const { t } = useTranslation();
  const selectedSet = new Set(selected);

  function toggle(mode: RouteType, checked: boolean) {
    onChange((current) => {
      const set = new Set(current);
      const next = available.filter((m) => (m === mode ? checked : set.has(m)));
      return next.length ? next : [mode];
    });
  }

  return (
    <div className="field" data-tour="modes">
      <span className="field-label">{t.transportModes}</span>
      <SbbCheckboxGroup orientation="vertical" size="s" className="modes-group">
        {available.map((mode) => (
          <SbbCheckbox
            key={mode}
            value={mode}
            checked={selectedSet.has(mode)}
            onChange={(e) => toggle(mode, (e.target as HTMLInputElement).checked)}
          >
            {t.modes[mode]}
          </SbbCheckbox>
        ))}
      </SbbCheckboxGroup>
    </div>
  );
}
