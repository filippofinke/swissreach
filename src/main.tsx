/**
 * Application entry point — mounts the React tree onto #root.
 */
import '@sbb-esta/lyne-elements/standard-theme.css';
import '@sbb-esta/lyne-elements/font-characters-extension.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n/I18nProvider';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
