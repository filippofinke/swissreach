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

  tour: {
    next: 'Vinavant',
    back: 'Enavos',
    done: 'Finì',
    progress: '{{current}} da {{total}}',
    replay: 'Repeter il tur',
    steps: {
      welcome: {
        title: 'Bainvegni tar SwissReach',
        body: 'Guarda quant lunsch che ti pos viagiar cun il traffic public dad mintga staziun svizra. Tut funcziuna en tes browser. I n’exista nagin backend. Quest curt tur mussa mintga funcziun. Dovra Vinavant ed Enavos, u serra el da tut temp.',
      },
      origin: {
        title: 'Tscherna tes punct da partenza',
        body: 'Tschertga qua ina staziun da gugent. La charta sa renovescha per mussar tut quai che ti pos cuntanscher dad là.',
      },
      date: {
        title: 'Tscherna il di',
        body: 'Tscherna il di da servetsch da planisar. I pon mo vegnir tschernids dis cun datas d’urari disponiblas.',
      },
      time: {
        title: 'Definescha l’ura da partenza',
        body: 'Ils temps da viadi vegnan calculads per viadis che partan enturn questa ura.',
      },
      duration: {
        title: 'Budget da temp',
        body: 'Mussa mo lieus cuntanschibels entaifer quest dumber da minutas. Smatga in valur predefinì u tippa tes agen valur.',
      },
      transfers: {
        title: 'Limitescha las midadas',
        body: 'Permetta mo viadis directs, u fin a 1, 2 u 3 midadas, u in dumber da gugent cun «Da gugent».',
      },
      metric: {
        title: 'Colurescha la charta',
        body: 'Colurescha la charta tenor il temp da viadi u tenor il dumber da midadas necessarias per arrivar là.',
      },
      resolution: {
        title: 'Detagl da la charta',
        body: 'Adatta quant fin che la rastra dad hexagons è. Pli aut vul dir dapli detagls; pli bass è pli svelt e pli en mument.',
      },
      modes: {
        title: 'Meds da transport',
        body: 'Includa u excluda trens, bus, trams, bartgas e dapli per vesair co che la zona cuntanschibla sa mida.',
      },
      map: {
        title: 'Tia zona cuntanschibla',
        body: 'Ils hexagons colurads mussan nua che ti pos arrivar, e la legenda declera las colurs. Clicca sin ina staziun sin la charta per ina colliaziun pass per pass, e per la definir sco nov punct da partenza.',
      },
      actions: {
        title: 'Cundivider, infurmaziuns e lingua',
        body: 'Copegia in link a tia vista actuala, avra la chaschetta d’infurmaziun u mida qua la lingua.',
      },
      replayStep: {
        title: 'Ti vuls puspè il tur?',
        body: 'Avra puspè quest tur guidà da tut temp cun quest buttun. Bun divertiment cun explorar la Svizra!',
      },
    },
  },
};
