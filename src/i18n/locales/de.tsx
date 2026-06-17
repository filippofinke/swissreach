import { Dictionary } from '../types';

export const de: Dictionary = {
  about: 'Über',
  aboutDescription:
    'zeigt, wie weit Sie in einer bestimmten Zeit mit öffentlichen Verkehrsmitteln von jedem Bahnhof aus reisen können. Alles — die Routenberechnung und die Karte — läuft vollständig in Ihrem Browser; es gibt kein Backend.',
  howItsBuilt: 'Wie es funktioniert',
  howItsBuiltDescription: (
    <>
      Verbindungen werden clientseitig mit dem RAPTOR-Algorithmus über{' '}
      <a href="https://github.com/aubryio/minotor" target="_blank" rel="noopener">
        minotor
      </a>
      {' '}berechnet, die Karte wird mit{' '}
      <a href="https://maplibre.org" target="_blank" rel="noopener">
        MapLibre GL
      </a>
      {' '}gerendert, und der Fahrplan stammt aus dem offenen Swiss GTFS-Feed auf{' '}
      <a href="https://opentransportdata.swiss" target="_blank" rel="noopener">
        opentransportdata.swiss
      </a>
      .
    </>
  ),
  createdBy: 'Erstellt von',
  createdByDescription: (
    <>
      Ein Open-Source-Projekt von{' '}
      <a href="https://github.com/filippofinke" target="_blank" rel="noopener">
        Filippo Finke
      </a>
      . Quellcode &amp; Issues auf{' '}
      <a href="https://github.com/filippofinke/swissreach" target="_blank" rel="noopener">
        GitHub
      </a>
      . Veröffentlicht unter der MIT-Lizenz.
    </>
  ),
  design: 'Design',
  designDescription: (
    <>
      Die Oberfläche ist der SBB Mobile App nachempfunden und verwendet die offenen{' '}
      <a href="https://digital.sbb.ch/en/design-system/lyne/overview/" target="_blank" rel="noopener">
        Lyne Design Tokens
      </a>
      {' '}der SBB.
    </>
  ),
  disclaimer: (
    <>
      Dies ist ein unabhängiges, <b>inoffizielles</b> Projekt. Es ist nicht mit der SBB verbunden, wird von ihr nicht unterstützt oder betrieben. „SBB“ und das SBB-Logo sind Marken der Schweizerischen Bundesbahnen SBB und erscheinen hier nur, um auf offizielle SBB-Dienste zu verweisen.
    </>
  ),

  loading: 'Wird geladen…',
  loadingDataError: 'ÖV-Daten konnten nicht geladen werden. Haben Sie `npm run data` ausgeführt?',
  computingIsochrone: 'Isochrone wird berechnet…',
  noDataError: 'Für diesen Tag sind keine Fahrplandaten verfügbar.',
  originNotFoundError: 'Startpunkt nicht im Fahrplan gefunden.',
  routingFailedError: 'Routenberechnung fehlgeschlagen.',
  stationsReachable: (count: number) => `${count} Bahnhöfe`,
  timeMs: (ms: number) => `${Math.round(ms)} ms`,
  linkCopied: 'Link in die Zwischenablage kopiert',

  searchOriginPlaceholder: 'Bahnhof suchen…',
  from: 'Von',
  date: 'Datum',
  departure: 'Abfahrt',
  maxDuration: 'Max. Dauer',
  within: 'Innerhalb',
  minutes: 'Minuten',
  maxTransfers: 'Max. Umstiege',
  direct: 'Direkt',
  unlimited: 'Alle',

  colorBy: 'Einfärben nach',
  duration: 'Dauer',
  transfers: 'Umstiege',
  resolution: 'Auflösung',
  high: 'Hoch',
  low: 'Niedrig',

  transportModes: 'Verkehrsmittel',
  modes: {
    RAIL: 'Zug',
    BUS: 'Bus',
    TRAM: 'Tram',
    SUBWAY: 'Metro',
    FERRY: 'Schiff',
    CABLE_TRAM: 'Standseilbahn',
    AERIAL_LIFT: 'Luftseilbahn',
    FUNICULAR: 'Standseilbahn',
    TROLLEYBUS: 'Trolleybus',
    MONORAIL: 'Einschienenbahn',
  },

  journeyFrom: 'Reise von',
  walkTo: 'Fussweg nach',
  transferAt: 'Umsteigen in',
  makeNewOrigin: 'Neuer Startpunkt',
  journeyNotFound: 'Kein direktes Ergebnis — versuchen Sie SBB für Optionen.',
  openInSbb: 'Auf SBB öffnen',
  findingConnection: 'Beste Verbindung wird gesucht…',
  couldNotLoadConnection: 'Verbindung konnte nicht geladen werden.',
  changes: (count: number) => `${count} Umstieg${count === 1 ? '' : 'e'}`,
  walk: 'Fussweg',
  change: 'Umsteigen',

  min: 'Min.',

  language: 'Sprache',

  tour: {
    next: 'Weiter',
    back: 'Zurück',
    done: 'Fertig',
    progress: '{{current}} von {{total}}',
    replay: 'Tour erneut starten',
    steps: {
      welcome: {
        title: 'Willkommen bei SwissReach',
        body: 'Sieh, wie weit du mit dem öffentlichen Verkehr von jeder Schweizer Station aus kommst. Alles läuft in deinem Browser. Es gibt kein Backend. Diese kurze Tour zeigt dir jede Funktion. Nutze Weiter und Zurück oder schliesse sie jederzeit.',
      },
      origin: {
        title: 'Startpunkt wählen',
        body: 'Suche hier eine beliebige Station. Die Karte zeigt dann alles, was du von dort aus erreichst.',
      },
      date: {
        title: 'Tag auswählen',
        body: 'Wähle den Fahrplantag. Es lassen sich nur Tage mit verfügbaren Fahrplandaten auswählen.',
      },
      time: {
        title: 'Abfahrtszeit festlegen',
        body: 'Die Reisezeiten werden für Fahrten berechnet, die ungefähr zu dieser Zeit losfahren.',
      },
      duration: {
        title: 'Zeitbudget',
        body: 'Zeige nur Orte, die innerhalb dieser Minutenzahl erreichbar sind. Tippe einen Vorschlag an oder gib einen eigenen Wert ein.',
      },
      transfers: {
        title: 'Umstiege begrenzen',
        body: 'Erlaube nur Direktverbindungen oder bis zu 1, 2 oder 3 Umstiege, oder beliebig viele mit «Beliebig».',
      },
      metric: {
        title: 'Karte einfärben',
        body: 'Färbe die Karte nach Reisezeit oder nach der Anzahl der nötigen Umstiege.',
      },
      resolution: {
        title: 'Kartendetail',
        body: 'Stelle ein, wie fein das Sechseckraster ist. Höher bedeutet mehr Detail; tiefer ist schneller und glatter.',
      },
      modes: {
        title: 'Verkehrsmittel',
        body: 'Schliesse Züge, Busse, Trams, Schiffe und mehr ein oder aus und sieh, wie sich der erreichbare Bereich ändert.',
      },
      map: {
        title: 'Dein erreichbarer Bereich',
        body: 'Farbige Sechsecke zeigen, wohin du kommst, und die Legende erklärt die Farben. Klicke auf eine Station auf der Karte für eine Verbindung Schritt für Schritt, und um sie als neuen Startpunkt zu setzen.',
      },
      actions: {
        title: 'Teilen, Info & Sprache',
        body: 'Kopiere einen Link zu deiner aktuellen Ansicht, öffne das Infofenster oder wechsle hier die Sprache.',
      },
      replayStep: {
        title: 'Tour nochmals ansehen?',
        body: 'Öffne diese geführte Tour jederzeit über diese Schaltfläche wieder. Viel Spass beim Entdecken der Schweiz!',
      },
    },
  },
};
