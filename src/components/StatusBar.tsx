/**
 * Bottom strip of the sidebar: status text + share/about icon buttons.
 */
import { SbbMiniButton } from '@sbb-esta/lyne-react/button';
import { useTranslation } from '../i18n/I18nProvider';
import type { Language } from '../i18n/types';

export type StatusBarProps = {
  status: string;
  busy?: boolean;
  onShare: () => void;
  onAbout: () => void;
};

export function StatusBar({ status, busy, onShare, onAbout }: StatusBarProps) {
  const { t, language, setLanguage } = useTranslation();

  return (
    <>
      <div id="status" className={`status${busy ? ' busy' : ''}`}>
        {status}
      </div>
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as Language)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', fontSize: 'var(--sbb-font-size-text-xs)', marginRight: '8px' }}
        title={t.language}
        aria-label={t.language}
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
        <option value="fr">FR</option>
        <option value="it">IT</option>
        <option value="rm">RM</option>
      </select>
      <SbbMiniButton
        iconName="share-small"
        aria-label="Copy share link"
        title="Copy share link"
        onClick={onShare}
      />
      <SbbMiniButton
        iconName="circle-information-small"
        aria-label={t.about}
        title={t.about}
        onClick={onAbout}
      />
    </>
  );
}
