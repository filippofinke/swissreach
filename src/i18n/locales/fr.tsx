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

  tour: {
    next: 'Suivant',
    back: 'Retour',
    done: 'Terminé',
    progress: '{{current}} sur {{total}}',
    replay: 'Revoir la visite',
    steps: {
      welcome: {
        title: 'Bienvenue sur SwissReach',
        body: 'Découvrez jusqu’où vous pouvez voyager en transports publics depuis n’importe quelle gare suisse. Tout fonctionne dans votre navigateur. Il n’y a pas de serveur. Cette courte visite présente chaque réglage. Utilisez Suivant et Retour, ou fermez la visite à tout moment.',
      },
      origin: {
        title: 'Choisissez votre point de départ',
        body: 'Recherchez ici n’importe quelle gare. La carte se redessine pour montrer tout ce que vous pouvez atteindre depuis ce point.',
      },
      date: {
        title: 'Choisissez le jour',
        body: 'Sélectionnez le jour d’exploitation à planifier. Seuls les jours dont l’horaire est disponible peuvent être choisis.',
      },
      time: {
        title: 'Définissez l’heure de départ',
        body: 'Les temps de trajet sont calculés pour les voyages partant aux alentours de cette heure.',
      },
      duration: {
        title: 'Budget de temps',
        body: 'N’afficher que les lieux accessibles en ce nombre de minutes. Touchez une valeur prédéfinie ou saisissez la vôtre.',
      },
      transfers: {
        title: 'Limitez les correspondances',
        body: 'N’autorisez que les trajets directs, ou jusqu’à 1, 2 ou 3 correspondances, ou un nombre quelconque avec « Toutes ».',
      },
      metric: {
        title: 'Colorez la carte',
        body: 'Teintez la carte selon le temps de trajet ou selon le nombre de correspondances nécessaires.',
      },
      resolution: {
        title: 'Détail de la carte',
        body: 'Réglez la finesse de la grille hexagonale. Plus élevé donne plus de détail ; plus bas est plus rapide et plus lisse.',
      },
      modes: {
        title: 'Modes de transport',
        body: 'Incluez ou excluez trains, bus, trams, bateaux et plus encore pour voir comment la zone accessible évolue.',
      },
      map: {
        title: 'Votre zone accessible',
        body: 'Les hexagones colorés montrent où vous pouvez aller, et la légende explique les couleurs. Cliquez sur une gare de la carte pour une connexion étape par étape, et pour en faire le nouveau point de départ.',
      },
      actions: {
        title: 'Partage, infos et langue',
        body: 'Copiez un lien vers votre vue actuelle, ouvrez la fenêtre d’informations ou changez de langue ici.',
      },
      replayStep: {
        title: 'Besoin de revoir la visite ?',
        body: 'Rouvrez cette visite guidée à tout moment depuis ce bouton. Bonne exploration de la Suisse !',
      },
    },
  },
};
