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

  tour: {
    next: 'Avanti',
    back: 'Indietro',
    done: 'Fine',
    progress: '{{current}} di {{total}}',
    replay: 'Rivedi il tour',
    steps: {
      welcome: {
        title: 'Benvenuto su SwissReach',
        body: 'Scopri fino a dove puoi viaggiare con i trasporti pubblici da qualsiasi stazione svizzera. Tutto funziona nel tuo browser. Non c’è alcun backend. Questo breve tour mostra ogni funzione. Usa Avanti e Indietro, oppure chiudilo quando vuoi.',
      },
      origin: {
        title: 'Scegli il punto di partenza',
        body: 'Cerca qui una qualsiasi stazione. La mappa si ridisegna per mostrare tutto ciò che puoi raggiungere da lì.',
      },
      date: {
        title: 'Scegli il giorno',
        body: 'Seleziona il giorno di servizio da pianificare. Si possono scegliere solo i giorni con orari disponibili.',
      },
      time: {
        title: 'Imposta l’ora di partenza',
        body: 'I tempi di viaggio sono calcolati per gli spostamenti che partono intorno a quest’ora.',
      },
      duration: {
        title: 'Budget di tempo',
        body: 'Mostra solo i luoghi raggiungibili entro questo numero di minuti. Tocca un valore predefinito o digita il tuo.',
      },
      transfers: {
        title: 'Limita i cambi',
        body: 'Consenti solo viaggi diretti, oppure fino a 1, 2 o 3 cambi, o un numero qualsiasi con «Tutti».',
      },
      metric: {
        title: 'Colora la mappa',
        body: 'Colora la mappa in base al tempo di viaggio o al numero di cambi necessari per arrivarci.',
      },
      resolution: {
        title: 'Dettaglio della mappa',
        body: 'Regola la finezza della griglia esagonale. Più alto significa più dettaglio; più basso è più rapido e uniforme.',
      },
      modes: {
        title: 'Mezzi di trasporto',
        body: 'Includi o escludi treni, bus, tram, battelli e altro per vedere come cambia l’area raggiungibile.',
      },
      map: {
        title: 'La tua area raggiungibile',
        body: 'Gli esagoni colorati mostrano dove puoi arrivare e la legenda spiega i colori. Clicca su una stazione sulla mappa per una connessione passo dopo passo, e per impostarla come nuovo punto di partenza.',
      },
      actions: {
        title: 'Condividi, info e lingua',
        body: 'Copia un link alla vista attuale, apri la finestra delle informazioni o cambia lingua qui.',
      },
      replayStep: {
        title: 'Vuoi rivedere il tour?',
        body: 'Riapri questo tour guidato in qualsiasi momento da questo pulsante. Buona esplorazione della Svizzera!',
      },
    },
  },
};
