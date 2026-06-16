import { Dictionary } from '../types';

export const fr: Dictionary = {
  about: 'À propos',
  aboutDescription:
    'montre jusqu\'où vous pouvez voyager en transports publics depuis n\'importe quelle gare dans un temps donné. Tout — le calcul de l\'itinéraire et la carte — fonctionne entièrement dans votre navigateur ; il n\'y a pas de backend.',
  howItsBuilt: 'Comment ça marche',
  howItsBuiltDescription: (
    <>
      Les connexions sont calculées côté client avec l'algorithme RAPTOR via{' '}
      <a href="https://github.com/aubryio/minotor" target="_blank" rel="noopener">
        minotor
      </a>
      , la carte est rendue avec{' '}
      <a href="https://maplibre.org" target="_blank" rel="noopener">
        MapLibre GL
      </a>
      , et l'horaire provient du flux ouvert Swiss GTFS sur{' '}
      <a href="https://opentransportdata.swiss" target="_blank" rel="noopener">
        opentransportdata.swiss
      </a>
      .
    </>
  ),
  createdBy: 'Créé par',
  createdByDescription: (
    <>
      Un projet open-source de{' '}
      <a href="https://github.com/filippofinke" target="_blank" rel="noopener">
        Filippo Finke
      </a>
      . Code source &amp; problèmes sur{' '}
      <a href="https://github.com/filippofinke/swissreach" target="_blank" rel="noopener">
        GitHub
      </a>
      . Publié sous licence MIT.
    </>
  ),
  design: 'Design',
  designDescription: (
    <>
      L'interface est inspirée de l'application CFF Mobile en utilisant les{' '}
      <a href="https://digital.sbb.ch/en/design-system/lyne/overview/" target="_blank" rel="noopener">
        Lyne design tokens
      </a>
      {' '}ouverts des CFF.
    </>
  ),
  disclaimer: (
    <>
      Ceci est un projet indépendant et <b>non officiel</b>. Il n'est pas affilié, soutenu ou exploité par les CFF. « CFF » et le logo CFF sont des marques déposées des Chemins de fer fédéraux suisses CFF et n'apparaissent ici que pour créer un lien vers les services officiels des CFF.
    </>
  ),

  loading: 'Chargement…',
  loadingDataError: 'Impossible de charger les données de transport. Avez-vous exécuté `npm run data` ?',
  computingIsochrone: 'Calcul de l\'isochrone…',
  noDataError: 'Données d\'horaire non disponibles pour ce jour.',
  originNotFoundError: 'Origine introuvable dans l\'horaire.',
  routingFailedError: 'Échec du calcul de l\'itinéraire.',
  stationsReachable: (count: number) => `${count} gares`,
  timeMs: (ms: number) => `${Math.round(ms)} ms`,
  linkCopied: 'Lien copié dans le presse-papiers',

  searchOriginPlaceholder: 'Rechercher une gare…',
  from: 'De',
  date: 'Date',
  departure: 'Départ',
  maxDuration: 'Durée max',
  within: 'Dans',
  minutes: 'minutes',
  maxTransfers: 'Correspondances max',
  direct: 'Direct',
  unlimited: 'Toutes',

  colorBy: 'Colorer par',
  duration: 'Durée',
  transfers: 'Correspondances',
  resolution: 'Résolution',
  high: 'Haute',
  low: 'Basse',

  transportModes: 'Moyens de transport',
  modes: {
    RAIL: 'Train',
    BUS: 'Bus',
    TRAM: 'Tram',
    SUBWAY: 'Métro',
    FERRY: 'Bateau',
    CABLE_TRAM: 'Funiculaire',
    AERIAL_LIFT: 'Téléphérique',
    FUNICULAR: 'Funiculaire',
    TROLLEYBUS: 'Trolleybus',
    MONORAIL: 'Monorail',
  },

  journeyFrom: 'Voyage depuis',
  walkTo: 'Marcher jusqu\'à',
  transferAt: 'Correspondance à',
  makeNewOrigin: 'Nouvelle origine',
  journeyNotFound: 'Aucun résultat direct — essayez les CFF pour des options.',
  openInSbb: 'Ouvrir sur CFF',
  findingConnection: 'Recherche de la meilleure connexion…',
  couldNotLoadConnection: 'Impossible de charger la connexion.',
  changes: (count: number) => `${count} correspondance${count === 1 ? '' : 's'}`,
  walk: 'Marche',
  change: 'Correspondance',

  min: 'min',

  language: 'Langue',
};
