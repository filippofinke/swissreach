import { Dictionary } from '../types';

export const it: Dictionary = {
  about: 'Informazioni',
  aboutDescription:
    'mostra quanto lontano puoi viaggiare con i mezzi pubblici da qualsiasi stazione in un dato tempo. Tutto — il calcolo del percorso e la mappa — funziona interamente nel tuo browser; non c\'è alcun backend.',
  howItsBuilt: 'Come funziona',
  howItsBuiltDescription: (
    <>
      Le connessioni sono calcolate lato client con l'algoritmo RAPTOR tramite{' '}
      <a href="https://github.com/aubryio/minotor" target="_blank" rel="noopener">
        minotor
      </a>
      , la mappa è renderizzata con{' '}
      <a href="https://maplibre.org" target="_blank" rel="noopener">
        MapLibre GL
      </a>
      , e gli orari provengono dal feed aperto Swiss GTFS su{' '}
      <a href="https://opentransportdata.swiss" target="_blank" rel="noopener">
        opentransportdata.swiss
      </a>
      .
    </>
  ),
  createdBy: 'Creato da',
  createdByDescription: (
    <>
      Un progetto open-source di{' '}
      <a href="https://github.com/filippofinke" target="_blank" rel="noopener">
        Filippo Finke
      </a>
      . Codice sorgente e segnalazioni su{' '}
      <a href="https://github.com/filippofinke/swissreach" target="_blank" rel="noopener">
        GitHub
      </a>
      . Rilasciato con licenza MIT.
    </>
  ),
  design: 'Design',
  designDescription: (
    <>
      L'interfaccia è ispirata all'app SBB Mobile utilizzando i{' '}
      <a href="https://digital.sbb.ch/en/design-system/lyne/overview/" target="_blank" rel="noopener">
        Lyne design tokens
      </a>
      {' '}aperti delle FFS.
    </>
  ),
  disclaimer: (
    <>
      Questo è un progetto indipendente e <b>non ufficiale</b>. Non è affiliato, supportato o gestito dalle FFS. “SBB” (FFS) e il logo SBB sono marchi registrati di Schweizerische Bundesbahnen SBB e compaiono qui solo per collegare ai servizi ufficiali FFS.
    </>
  ),

  loading: 'Caricamento…',
  loadingDataError: 'Impossibile caricare i dati di transito. Hai eseguito `npm run data`?',
  computingIsochrone: 'Calcolo dell\'isocrona…',
  noDataError: 'Dati orario non disponibili per questo giorno.',
  originNotFoundError: 'Origine non trovata nell\'orario.',
  routingFailedError: 'Calcolo del percorso fallito.',
  stationsReachable: (count: number) => `${count} stazioni`,
  timeMs: (ms: number) => `${Math.round(ms)} ms`,
  linkCopied: 'Link copiato negli appunti',

  searchOriginPlaceholder: 'Cerca una stazione…',
  from: 'Da',
  date: 'Data',
  departure: 'Partenza',
  maxDuration: 'Durata massima',
  within: 'Entro',
  minutes: 'minuti',
  maxTransfers: 'Cambi massimi',
  direct: 'Diretto',
  unlimited: 'Qualsiasi',

  colorBy: 'Colora per',
  duration: 'Durata',
  transfers: 'Cambi',
  resolution: 'Risoluzione',
  high: 'Alta',
  low: 'Bassa',

  transportModes: 'Mezzi di trasporto',
  modes: {
    RAIL: 'Treno',
    BUS: 'Bus',
    TRAM: 'Tram',
    SUBWAY: 'Metro',
    FERRY: 'Battello',
    CABLE_TRAM: 'Funicolare a fune',
    AERIAL_LIFT: 'Funivia',
    FUNICULAR: 'Funicolare',
    TROLLEYBUS: 'Filobus',
    MONORAIL: 'Monorotaia',
  },

  journeyFrom: 'Viaggio da',
  walkTo: 'Cammina fino a',
  transferAt: 'Cambio a',
  makeNewOrigin: 'Nuova origine',
  journeyNotFound: 'Nessun risultato diretto — prova SBB per le opzioni.',
  openInSbb: 'Apri su SBB',
  findingConnection: 'Ricerca della connessione migliore…',
  couldNotLoadConnection: 'Impossibile caricare la connessione.',
  changes: (count: number) => `${count} cambi${count === 1 ? 'o' : ''}`,
  walk: 'Cammina',
  change: 'Cambia',

  min: 'min',

  language: 'Lingua',
};
