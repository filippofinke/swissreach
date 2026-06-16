/**
 * About dialog using Lyne's dialog component.
 */
import { SbbDialog, SbbDialogContent, SbbDialogTitle } from '@sbb-esta/lyne-react/dialog';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/I18nProvider';

export type AboutDialogProps = {
  open: boolean;
  onClose: () => void;
};

type SbbDialogElement = HTMLElement & {
  open: () => void;
  close: () => void;
};

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const { t } = useTranslation();
  const ref = useRef<SbbDialogElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.open();
    else el.close();
  }, [open]);

  return (
    <SbbDialog ref={ref as never} onClose={onClose}>
      <SbbDialogTitle>{t.about}</SbbDialogTitle>
      <SbbDialogContent>
        <p>
          <b>SwissReach</b> {t.aboutDescription}
        </p>

        <h3>{t.howItsBuilt}</h3>
        <p>{t.howItsBuiltDescription}</p>

        <h3>{t.createdBy}</h3>
        <p>{t.createdByDescription}</p>

        <h3>{t.design}</h3>
        <p>{t.designDescription}</p>

        <div className="disclaimer">
          <span>{t.disclaimer}</span>
        </div>
      </SbbDialogContent>
    </SbbDialog>
  );
}
