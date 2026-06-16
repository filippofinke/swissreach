import { Dictionary } from '../types';

export const rm: Dictionary = {
  about: 'Davart',
  aboutDescription:
    'mussa quant lunsch che vus pudais viagiar cun il traffic public da mintga staziun en in temp dà. Tut — il calcul da la ruta ed la charta — funcziunescha dal tuttafatg en voss navigatur; i na dat nagin backend.',
  howItsBuilt: 'Cua funcziuni',
  howItsBuiltDescription: (
    <>
      Las colliaziuns vegnan calculadas sin il client cun l'algoritmus RAPTOR via{' '}
      <a href="https://github.com/aubryio/minotor" target="_blank" rel="noopener">
        minotor
      </a>
      , la charta vegn visualisada cun{' '}
      <a href="https://maplibre.org" target="_blank" rel="noopener">
        MapLibre GL
      </a>
      , e l'urari deriva dal feed avert Swiss GTFS sin{' '}
      <a href="https://opentransportdata.swiss" target="_blank" rel="noopener">
        opentransportdata.swiss
      </a>
      .
    </>
  ),
  createdBy: 'Creà da',
  createdByDescription: (
    <>
      In project open-source da{' '}
      <a href="https://github.com/filippofinke" target="_blank" rel="noopener">
        Filippo Finke
      </a>
      . Code da funtauna e problems sin{' '}
      <a href="https://github.com/filippofinke/swissreach" target="_blank" rel="noopener">
        GitHub
      </a>
      . Publitgà sut la licenza MIT.
    </>
  ),
  design: 'Design',
  designDescription: (
    <>
      L'interfatscha è s'inspirada da l'app SBB Mobile e dovra ils{' '}
      <a href="https://digital.sbb.ch/en/design-system/lyne/overview/" target="_blank" rel="noopener">
        Lyne design tokens
      </a>
      {' '}averts da las viafiers federalas SBB.
    </>
  ),
  disclaimer: (
    <>
      Quai è in project independent e <b>betg uffizial</b>. El n'è betg affilià, sustegnì u gestiunà da la SBB. "SBB" ed il logo da la SBB èn marcas registradas da las Viafiers federalas svizras SBB e cumparan qua be per collialar als servetschs uffizials da la SBB.
    </>
  ),

  loading: 'Chargiar…',
  loadingDataError: 'Impussibel da chargiar las datas da transit. Avais vus exequì `npm run data`?',
  computingIsochrone: 'Calculond l\'isocrona…',
  noDataError: 'Datas d\'urari betg disponiblas per quest di.',
  originNotFoundError: 'Origin betg chattà en l\'urari.',
  routingFailedError: 'Il calcul da la ruta ha fatg naufragi.',
  stationsReachable: (count: number) => `${count} staziuns`,
  timeMs: (ms: number) => `${Math.round(ms)} ms`,
  linkCopied: 'Link copià en l\'archiv',

  searchOriginPlaceholder: 'Tschertgar ina staziun…',
  from: 'Da',
  date: 'Data',
  departure: 'Partenza',
  maxDuration: 'Durada maximala',
  within: 'Entaifer',
  minutes: 'minutas',
  maxTransfers: 'Midadas maximalas',
  direct: 'Direct',
  unlimited: 'Tuts',

  colorBy: 'Colurar tenor',
  duration: 'Durada',
  transfers: 'Midadas',
  resolution: 'Resoluziun',
  high: 'Ata',
  low: 'Bassa',

  transportModes: 'Meds da transport',
  modes: {
    RAIL: 'Tren',
    BUS: 'Bus',
    TRAM: 'Tram',
    SUBWAY: 'Metro',
    FERRY: 'Batel',
    CABLE_TRAM: 'Funiculara',
    AERIAL_LIFT: 'Teleferica',
    FUNICULAR: 'Funiculara',
    TROLLEYBUS: 'Trolleybus',
    MONORAIL: 'Monorail',
  },

  journeyFrom: 'Viadi da',
  walkTo: 'Caminar a',
  transferAt: 'Midada a',
  makeNewOrigin: 'Nov origin',
  journeyNotFound: 'Nagin resultat direct — emprovai SBB per opziuns.',
  openInSbb: 'Avertir sin SBB',
  findingConnection: 'Tschertgond la meglra colliaziun…',
  couldNotLoadConnection: 'Impussibel da chargiar la colliaziun.',
  changes: (count: number) => `${count} midad${count === 1 ? 'a' : 'as'}`,
  walk: 'Caminar',
  change: 'Midada',

  min: 'min',

  language: 'Lingua',
};
