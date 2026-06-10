import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const today = "2026-06-09";
const siteUrl = "https://www.drivelady.fr";
const defaultBlogImage = "/assets/drive-lady-hero.avif";

const sources = {
  transports: {
    label: "Interstats, ministère de l'Intérieur",
    url: "https://www.interieur.gouv.fr/fr/Interstats/Actualites/Transports-en-commun-en-2024-le-plus-bas-niveau-de-victimes-enregistrees-depuis-2016",
    fact: "En 2024, 107 080 victimes de vols, violences, escroqueries ou fraudes aux moyens de paiement ont été enregistrées dans les transports en commun, en baisse de 8 % sur un an.",
  },
  outrages: {
    label: "Interstats, outrages sexistes et sexuels 2024",
    url: "https://www.interieur.gouv.fr/Interstats/Actualites/Info-rapide-n-50-Premiere-baisse-en-2024-des-infractions-pour-outrage-sexiste-et-sexuel-enregistrees",
    fact: "En 2024, 3 200 infractions pour outrage sexiste ou sexuel ont été enregistrées ; sur le périmètre police nationale, 15 % ont lieu dans les transports en commun.",
  },
  aide: {
    label: "Arrêtons les violences",
    url: "https://arretonslesviolences.gouv.fr/besoin-d-aide/outrages-sexistes-et-sexuels",
    fact: "En cas de danger immédiat, les canaux officiels restent le 17, le 112 ou le 114 par SMS ; le 3919 n'est pas un numéro d'urgence.",
  },
  covoiturage: {
    label: "Ministère de la Transition écologique",
    url: "https://www.ecologie.gouv.fr/politiques-publiques/covoiturage-france-ses-avantages-reglementation-vigueur",
    fact: "Le Gouvernement vise 3 millions de trajets quotidiens en covoiturage à l'horizon 2027 ; 12 millions de trajets ont été réalisés via plateformes en 2024.",
  },
  route: {
    label: "Sécurité routière, bilan définitif 2024",
    url: "https://www.securite-routiere.gouv.fr/actualites/bilan-definitif-2024",
    fact: "En 2024, près de 1 250 décès sont estimés dans un accident où au moins un conducteur était positif à l'alcool ou aux stupéfiants.",
  },
  campus: {
    label: "Ministère de l'Enseignement supérieur",
    url: "https://www.enseignementsup-recherche.gouv.fr/fr/les-effectifs-etudiants-dans-l-enseignement-superieur-en-2023-2024-96934",
    fact: "En 2023-2024, 2,97 millions d'étudiantes et étudiants étaient inscrits dans l'enseignement supérieur.",
  },
  vssEsr: {
    label: "Plan VSS dans l'enseignement supérieur",
    url: "https://www.enseignementsup-recherche.gouv.fr/fr/violences-sexistes-et-sexuelles-95919",
    fact: "3,5 millions d'euros par an sont alloués au plan d'action contre les violences sexistes et sexuelles dans l'enseignement supérieur et la recherche.",
  },
  festivals: {
    label: "Ministère de la Culture, festivals",
    url: "https://www.culture.gouv.fr/themes/Festivals",
    fact: "Le ministère de la Culture estime que la France compte plusieurs milliers de festivals ; environ 70 % des festivals existants ont vu le jour après les années 2000.",
  },
  cnil: {
    label: "CNIL, principes RGPD",
    url: "https://cnil.fr/fr/comprendre-le-rgpd/les-six-grands-principes-du-rgpd",
    fact: "Le principe de minimisation limite la collecte aux seules données strictement nécessaires à la réalisation de l'objectif poursuivi.",
  },
};

const authors = {
  camille: {
    name: "Camille Cottard",
    role: "Co-fondatrice · Vision & développement",
    image: "/assets/site-camille-cottard.png",
  },
  margaux: {
    name: "Margaux Hutyra",
    role: "Co-fondatrice · Communication & communauté",
    image: "/assets/site-margaux-hutyra.jpg",
  },
};

const authorByCategory = {
  Sécurité: "camille",
  Trajets: "camille",
  Partenaires: "margaux",
  Communauté: "margaux",
};

const articles = [
  {
    slug: "retour-soiree-securite-femmes",
    category: "Sécurité",
    cluster: "Retours de soirée",
    intent: "Comment rentrer de soirée en sécurité quand on ne veut pas rentrer seule ?",
    title: "Comment rentrer de soirée en sécurité sans improviser au dernier moment ?",
    metaTitle: "Comment rentrer de soirée en sécurité ? Checklist femmes | Drive Lady",
    metaDescription: "Méthode pratique pour préparer un retour de soirée plus rassurant : horaire, point de rendez-vous, profil vérifié, partage du trajet et réflexes d'urgence.",
    summary: "Un retour de soirée sûr se décide avant que le groupe soit fatigué, séparé ou pressé. La bonne méthode consiste à choisir une heure, nommer un point de rendez-vous visible, vérifier les informations du trajet et garder une solution de repli.",
    answer: "Pour rentrer de soirée avec moins de stress, fixe ton heure de départ avant la fin de l'événement, choisis un point de rendez-vous éclairé et facile à expliquer, vérifie l'identité et le véhicule de la conductrice, partage le trajet à une proche, puis garde les numéros d'urgence accessibles. L'objectif n'est pas de tout contrôler, mais de supprimer les décisions floues au moment où tu es la moins disponible.",
    stat: {
      number: "1 250",
      label: "décès liés à l'alcool ou aux stupéfiants au volant sont estimés en 2024. Prévoir son retour évite de devoir choisir sous pression.",
    },
    takeaways: [
      "L'heure de départ doit être décidée avant la fatigue, pas au moment de sortir.",
      "Le point de rendez-vous doit être visible, éclairé et distinct de la foule.",
      "Drive Lady doit rester une option de confiance, jamais un substitut aux urgences.",
    ],
    sections: [
      {
        title: "Pourquoi le dernier quart d'heure est le plus risqué pour l'organisation",
        body: [
          "Le problème d'un retour de soirée vient rarement d'un manque de volonté. Il vient d'une accumulation de micro-décisions prises trop tard : une amie part avant les autres, le téléphone passe sous les 10 %, le réseau devient mauvais, le lieu ferme, la rue se remplit et personne ne sait exactement qui rentre avec qui.",
          "Une application comme Drive Lady doit donc aider à déplacer la décision en amont. Quand l'heure, le lieu de départ, la conductrice et l'itinéraire sont déjà lisibles, le retour demande moins d'énergie. C'est ce qui transforme une promesse de sécurité en usage concret.",
        ],
        steps: [
          ["Choisir l'heure cible", "Décide l'heure de départ avant le début de la soirée ou au moment où le programme devient clair."],
          ["Nommer le point de rendez-vous", "Utilise un repère stable : pharmacie, hall d'hôtel, entrée latérale, parking identifié, arrêt éclairé."],
          ["Vérifier le trajet", "Relis le prénom, la plaque, le modèle du véhicule, la destination et le nombre de passagères."],
          ["Partager l'information", "Envoie l'heure, le point de départ et le suivi de trajet à une proche si tu en ressens le besoin."],
        ],
      },
      {
        title: "La checklist à relire avant de monter",
        body: "La checklist ne doit pas ressembler à une procédure anxiogène. Elle doit être courte, lisible et actionnable, comme une vérification de bon sens avant de quitter un lieu animé.",
        table: [
          ["Élément", "À vérifier", "Pourquoi c'est utile"],
          ["Conductrice", "Prénom, photo, profil et avis", "Réduit l'inconnu avant le départ."],
          ["Véhicule", "Plaque, modèle, couleur", "Évite de monter dans la mauvaise voiture."],
          ["Lieu", "Point précis et éclairé", "Limite l'attente seule dehors."],
          ["Trajet", "Destination et éventuels arrêts", "Évite les ambiguïtés pendant le retour."],
          ["Contact", "Partage du trajet ou message à une proche", "Donne un repère extérieur si le plan change."],
        ],
      },
      {
        title: "Que faire si le plan change ?",
        body: [
          "Un bon plan de retour doit accepter les imprévus : retard, annulation, groupe séparé, amie malade, fermeture plus tardive que prévu. Dans ces cas, la bonne réaction est de revenir à une règle simple : se déplacer vers un endroit visible, prévenir quelqu'un, puis choisir la solution la plus claire.",
          "Si la situation devient urgente ou menaçante, il faut sortir du cadre applicatif. Drive Lady peut aider à organiser un trajet, mais les canaux officiels sont les seuls bons relais en danger immédiat.",
        ],
        compare: {
          goodTitle: "À privilégier",
          badTitle: "À éviter",
          good: [
            "Attendre dans un lieu éclairé ou avec du personnel.",
            "Envoyer un message clair au groupe : heure, lieu, trajet.",
            "Annuler et refaire un trajet si une information ne correspond pas.",
          ],
          bad: [
            "Changer de point de rendez-vous sans prévenir.",
            "Monter si la plaque, le prénom ou le trajet ne correspondent pas.",
            "Se forcer à conduire après alcool ou forte fatigue.",
          ],
        },
      },
      {
        title: "Ce que Drive Lady doit apporter dans ce moment",
        body: "La valeur de Drive Lady n'est pas de promettre un monde sans risque. C'est de rendre visibles les bons signaux au bon moment : profils vérifiés, informations de trajet compréhensibles, partage possible, règles communautaires et signalement accessible. Une marque rassurante parle vrai, sans dramatiser la sortie ni minimiser les situations vécues.",
      },
    ],
    checklist: [
      "Heure de départ décidée avant la sortie",
      "Point de rendez-vous nommé et éclairé",
      "Téléphone chargé ou batterie externe prévue",
      "Plaque et modèle du véhicule vérifiés",
      "Trajet partagé si besoin",
      "Solution de repli identifiée",
    ],
    sourceKeys: ["route", "aide"],
    faqs: [
      ["Quand réserver son retour de soirée ?", "Le plus simple est de le prévoir avant le début de la soirée ou dès que l'heure de fin devient claire. La réservation tardive reste possible, mais elle expose davantage aux décisions prises dans la fatigue, la foule ou l'urgence."],
      ["Quel point de rendez-vous choisir ?", "Choisis un endroit visible, éclairé, accessible en voiture et facile à décrire. Évite la sortie principale d'un lieu bondé si elle crée de la confusion. Un repère stable vaut mieux qu'une adresse vague."],
      ["Que faire en cas de danger immédiat ?", "Il faut appeler le 17, le 112 ou envoyer un SMS au 114 si appeler n'est pas possible. Le 3919 peut orienter, mais ce n'est pas un numéro d'urgence."],
    ],
  },
  {
    slug: "harcelement-transports-retour-femmes",
    category: "Sécurité",
    cluster: "Transports et alternatives",
    intent: "Que faire quand on ne se sent pas en sécurité dans les transports le soir ?",
    title: "Harcèlement dans les transports : comment prévoir une alternative de retour ?",
    metaTitle: "Harcèlement transports : prévoir une alternative de retour | Drive Lady",
    metaDescription: "Guide utile pour anticiper une alternative aux transports le soir : signaux d'inconfort, covoiturage entre femmes, point de rendez-vous, signalement et urgences.",
    summary: "Les transports restent indispensables, mais certaines femmes veulent une alternative sur certains horaires, correspondances ou retours. La bonne réponse n'est pas de faire peur : c'est de préparer un plan clair avant de se retrouver seule avec peu d'options.",
    answer: "Quand un trajet en transport ne te rassure pas, prépare une alternative avant le départ : identifie le segment qui pose problème, vérifie l'horaire du dernier transport, choisis un point de pickup visible, préviens une proche et garde les canaux de signalement. Le covoiturage entre femmes peut être une option complémentaire lorsque le besoin principal est la visibilité du profil, du lieu de départ et du trajet.",
    stat: {
      number: "107 080",
      label: "victimes de vols, violences, escroqueries ou fraudes ont été enregistrées dans les transports en commun en 2024.",
    },
    takeaways: [
      "Le besoin naît souvent d'un segment précis : correspondance, marche finale, attente tardive.",
      "Une alternative utile se prépare avant la sortie, pas après le dernier métro.",
      "Le signalement officiel reste nécessaire en cas d'outrage, menace ou agression.",
    ],
    sections: [
      {
        title: "Identifier le vrai point de friction du trajet",
        body: [
          "Dire que l'on ne se sent pas en sécurité dans les transports est souvent trop large pour agir. Le malaise vient parfois d'une station précise, d'une correspondance longue, d'une marche finale, d'un quai désert, d'un dernier train ou d'un retour après alcoolisation du groupe.",
          "Drive Lady doit aider à transformer cette inquiétude en décision pratique : quel segment éviter, à quelle heure partir, où être récupérée, qui prévenir et quelle solution garder si le premier plan tombe.",
        ],
        list: [
          "Le temps d'attente entre deux lignes.",
          "La marche seule entre l'arrêt et le domicile.",
          "L'arrivée dans une gare ou un parking peu animé.",
          "Le retour après un événement où le groupe se sépare.",
        ],
      },
      {
        title: "Quand le covoiturage devient une option logique",
        body: "Le covoiturage entre femmes n'a pas vocation à remplacer tous les transports. Il devient pertinent quand l'utilisatrice cherche une information plus lisible sur la personne avec qui elle rentre, l'heure de départ, le point de pickup et le trajet exact.",
        table: [
          ["Situation", "Alternative à préparer", "Point de vigilance"],
          ["Dernier transport incertain", "Trajet Drive Lady réservé plus tôt", "Ne pas attendre la fermeture du lieu."],
          ["Correspondance longue", "Pickup près d'un repère éclairé", "Éviter les zones sans personnel."],
          ["Retour après concert", "Point à l'écart du flux principal", "Nommer le lieu dans le groupe."],
          ["Marche finale isolée", "Dépose plus proche ou accompagnée", "Partager l'heure d'arrivée."],
        ],
      },
      {
        title: "Ne pas confondre alternative et silence",
        body: [
          "Prévoir une alternative ne signifie pas accepter le harcèlement comme une fatalité. Si un outrage, une menace, un geste déplacé ou une agression survient, le signalement peut compter pour la victime, les témoins et les prochains trajets.",
          "Le bon discours de Drive Lady doit donc tenir deux idées ensemble : proposer une option plus confortable pour rentrer, et rappeler que les violences sexistes et sexuelles relèvent de dispositifs officiels lorsqu'elles surviennent.",
        ],
        compare: {
          goodTitle: "Réflexes utiles",
          badTitle: "Faux bons réflexes",
          good: [
            "Se rapprocher d'un agent, d'un commerce ou d'un groupe visible.",
            "Conserver les éléments factuels : heure, lieu, ligne, captures.",
            "Utiliser les numéros d'urgence si la situation est immédiate.",
          ],
          bad: [
            "Rester seule sur un quai pour ne pas déranger.",
            "Attendre d'être rentrée pour prévenir quelqu'un si tu es suivie.",
            "Penser que changer d'itinéraire remplace un signalement nécessaire.",
          ],
        },
      },
      {
        title: "Ce que l'article doit rassurer sans survendre",
        body: "Une marque de mobilité féminine crédible ne vend pas une sécurité absolue. Elle explique les limites, montre les bons signaux et donne un plan simple. C'est cette sobriété qui rend le contenu utile pour Google, les IA et surtout les utilisatrices.",
      },
    ],
    checklist: [
      "Segment du trajet qui pose problème identifié",
      "Horaire du dernier transport vérifié",
      "Point de pickup visible choisi",
      "Trajet alternatif préparé avant la sortie",
      "Numéros utiles enregistrés",
      "Preuves conservées en cas d'incident",
    ],
    sourceKeys: ["transports", "outrages", "aide"],
    faqs: [
      ["Drive Lady remplace-t-il les transports en commun ?", "Non. Drive Lady peut être une option complémentaire sur les trajets, horaires ou retours où l'utilisatrice veut plus de visibilité et de confiance. Les transports restent indispensables pour la majorité des déplacements."],
      ["Quels numéros connaître en cas de danger ?", "En danger immédiat, il faut appeler le 17, le 112 ou envoyer un SMS au 114 si appeler n'est pas possible. Le 3919 peut orienter, mais ce n'est pas un numéro d'urgence."],
      ["Pourquoi parler des chiffres sans faire peur ?", "Parce que les chiffres donnent du contexte sans transformer chaque trajet en menace. Ils permettent de reconnaître un besoin réel et de proposer une réponse pratique, proportionnée et rassurante."],
    ],
  },
  {
    slug: "profil-verifie-covoiturage-femmes",
    category: "Sécurité",
    cluster: "Confiance",
    intent: "Comment savoir si un profil de covoiturage est fiable ?",
    title: "Profil vérifié en covoiturage : quels signaux regarder avant de réserver ?",
    metaTitle: "Profil vérifié en covoiturage : signaux de confiance | Drive Lady",
    metaDescription: "Les signaux concrets à regarder avant un covoiturage entre femmes : identité, véhicule, avis, historique, cohérence du trajet et données utiles sans surveillance excessive.",
    summary: "Un badge de vérification ne suffit pas à créer la confiance. Avant un trajet, il faut plusieurs signaux cohérents : identité lisible, véhicule renseigné, avis récents, règles du trajet et possibilité de signaler.",
    answer: "Un profil de covoiturage devient plus rassurant quand plusieurs signaux se recoupent : identité vérifiée, photo cohérente, véhicule renseigné, plaque visible avant le départ, avis récents, historique de trajets et échange clair sur le point de rendez-vous. Aucun badge ne garantit tout ; la confiance vient de la cohérence des informations et d'un signalement facile si quelque chose ne va pas.",
    stat: {
      number: "6",
      label: "principes RGPD encadrent la collecte de données, dont la minimisation et la transparence.",
    },
    takeaways: [
      "La confiance se construit par accumulation de signaux, pas par un badge unique.",
      "Les informations visibles doivent aider à décider sans exposer trop de données.",
      "Un bon parcours de confiance assume aussi le signalement après le trajet.",
    ],
    sections: [
      {
        title: "Un bon profil répond à trois questions simples",
        body: [
          "Avant de réserver, l'utilisatrice cherche rarement un long discours. Elle veut savoir qui conduit, dans quelle voiture, sur quel trajet et avec quel historique. Si ces informations sont dispersées, la vérification perd de sa valeur.",
          "Drive Lady doit donc hiérarchiser les signaux de confiance dans l'ordre de décision : identité, trajet, véhicule, comportement observé par la communauté, puis règles de contact et de signalement.",
        ],
        steps: [
          ["Qui est la conductrice ?", "Prénom, photo, vérification et ancienneté doivent être lisibles sans fouiller l'écran."],
          ["Quel véhicule arrive ?", "Modèle, couleur et plaque évitent les confusions au point de rendez-vous."],
          ["Que dit l'historique ?", "Des avis récents et précis valent mieux qu'une note moyenne isolée."],
        ],
      },
      {
        title: "Les signaux à regarder avant de confirmer",
        body: "Les meilleurs signaux sont ceux qui réduisent une incertitude précise. Une information utile doit servir à reconnaître, comprendre ou décider ; sinon elle ajoute de la friction sans créer de confiance.",
        table: [
          ["Signal", "Ce qu'il rassure", "Limite à garder en tête"],
          ["Identité vérifiée", "La personne existe et a passé un contrôle", "Ce n'est pas une garantie de comportement."],
          ["Avis récents", "Le trajet a été vécu par d'autres", "Les avis doivent rester factuels."],
          ["Véhicule renseigné", "La voiture est identifiable", "La plaque doit correspondre au départ."],
          ["Trajet précis", "Les arrêts et horaires sont compris", "Un changement doit être confirmé."],
          ["Signalement visible", "Un recours existe après le trajet", "L'urgence reste hors application."],
        ],
      },
      {
        title: "La donnée de sécurité doit rester proportionnée",
        body: [
          "Une application de mobilité manipule des données sensibles par contexte : localisation, habitudes, horaires, lieux de sortie. Demander trop d'informations peut paradoxalement diminuer la confiance si l'utilisatrice ne comprend pas pourquoi elles sont nécessaires.",
          "La bonne ambition pour Drive Lady est claire : collecter ce qui aide réellement au trajet, expliquer l'usage et éviter de transformer la sécurité en surveillance permanente.",
        ],
        compare: {
          goodTitle: "Donnée utile",
          badTitle: "Donnée excessive",
          good: [
            "Identité, contact, véhicule et informations de trajet.",
            "Historique nécessaire à la confiance communautaire.",
            "Conservation limitée et expliquée.",
          ],
          bad: [
            "Demander des informations sans finalité claire.",
            "Afficher plus de données que nécessaire aux passagères.",
            "Rendre la sécurité opaque sous prétexte de rassurer.",
          ],
        },
      },
      {
        title: "Pourquoi les avis comptent autant que la vérification",
        body: "La vérification dit qu'un compte respecte une condition d'entrée. Les avis racontent l'expérience réelle : ponctualité, respect du point de départ, conduite, communication, ambiance. Pour une communauté de femmes, cette mémoire collective est un actif produit aussi important que le formulaire d'inscription.",
      },
    ],
    checklist: [
      "Identité vérifiée consultée",
      "Photo et prénom cohérents",
      "Véhicule et plaque renseignés",
      "Avis récents lus",
      "Point de rendez-vous confirmé",
      "Bouton signalement identifié",
    ],
    sourceKeys: ["cnil", "aide"],
    faqs: [
      ["Un profil vérifié garantit-il un trajet parfait ?", "Non. Il réduit l'incertitude, mais il doit être complété par des avis, des informations de trajet claires, une vérification du véhicule au départ et un dispositif de signalement."],
      ["Pourquoi afficher la plaque du véhicule ?", "Parce qu'elle permet d'identifier la bonne voiture au point de rendez-vous. C'est un signal pratique, surtout dans une rue fréquentée ou à la sortie d'un événement."],
      ["Quelles données Drive Lady doit-il demander ?", "Seulement les données nécessaires au service : identité, contact, trajet, véhicule et éléments utiles à la confiance. La collecte doit rester proportionnée et compréhensible."],
    ],
  },
  {
    slug: "premier-trajet-drive-lady",
    category: "Communauté",
    cluster: "Premiers pas",
    intent: "Comment se passe un premier trajet Drive Lady ?",
    title: "Premier trajet Drive Lady : comment se préparer comme passagère ou conductrice ?",
    metaTitle: "Premier trajet Drive Lady : guide passagère et conductrice",
    metaDescription: "Guide pratique pour réussir son premier trajet Drive Lady : profil, message, point de rendez-vous, règles à poser, paiement, avis et signalement.",
    summary: "Le premier trajet doit réduire les hésitations des deux côtés. La passagère veut être rassurée, la conductrice veut éviter les imprévus, et la communauté a besoin de règles simples pour créer une confiance durable.",
    answer: "Pour un premier trajet Drive Lady, complète ton profil, choisis un trajet simple, confirme le point de rendez-vous, relis les informations du véhicule, envoie un message court si un détail manque, puis laisse un avis factuel après l'arrivée. Côté conductrice, l'essentiel est d'annoncer clairement l'horaire, les arrêts possibles, les règles du trajet et le canal de contact.",
    stat: {
      number: "12 M",
      label: "de trajets ont été réalisés via plateformes de covoiturage en 2024, signe que l'usage devient plus courant.",
    },
    takeaways: [
      "Le premier trajet doit être simple, court et bien documenté.",
      "Les règles utiles se posent avant le départ : retard, arrêt, bagage, contact.",
      "L'avis après trajet construit la confiance de toute la communauté.",
    ],
    sections: [
      {
        title: "Avant de réserver : choisir un trajet facile",
        body: [
          "Pour une première expérience, il vaut mieux éviter le trajet le plus complexe. Un itinéraire connu, un horaire confortable et un point de rendez-vous clair permettent de tester le service sans ajouter de stress.",
          "Drive Lady doit encourager cette logique progressive : commencer par un trajet lisible, comprendre les signaux de confiance, puis utiliser la plateforme sur des contextes plus sensibles une fois les réflexes installés.",
        ],
        list: [
          "Un trajet déjà connu ou facile à expliquer.",
          "Une heure qui laisse une marge de 10 à 15 minutes.",
          "Un point de rendez-vous avec un repère visible.",
          "Une conductrice avec profil complet et avis lisibles.",
        ],
      },
      {
        title: "Passagère : ce qu'il faut vérifier",
        body: "La passagère n'a pas besoin d'un manuel. Elle a besoin d'une courte séquence de décision : est-ce le bon profil, le bon véhicule, le bon lieu et le bon trajet ?",
        table: [
          ["Moment", "Action", "Message recommandé"],
          ["Avant réservation", "Lire profil, avis, trajet", "Je vérifie que le trajet correspond à mon besoin."],
          ["Après confirmation", "Envoyer une précision si besoin", "Bonjour, je serai devant l'entrée côté pharmacie à 23 h 10."],
          ["Au départ", "Comparer plaque et modèle", "Je monte uniquement si les informations correspondent."],
          ["Après arrivée", "Laisser un avis factuel", "Ponctualité, communication, respect du trajet."],
        ],
      },
      {
        title: "Conductrice : poser un cadre sans être rigide",
        body: [
          "La conductrice rassure quand elle annonce simplement ce qui est possible et ce qui ne l'est pas : heure de départ, retard accepté, détour, bagage, musique, place disponible et point exact de prise en charge.",
          "Le bon ton n'est ni autoritaire ni flou. Il donne des repères. C'est précisément ce qui permet à Drive Lady d'aspirer à une communauté fiable plutôt qu'à une simple marketplace de sièges libres.",
        ],
        steps: [
          ["Créer le trajet", "Renseigne l'itinéraire, l'heure, le véhicule et les arrêts possibles."],
          ["Confirmer les demandes", "Vérifie que chaque passagère comprend le point de départ."],
          ["Prévenir en cas de retard", "Un message court suffit : nouvelle heure, raison, option d'annulation."],
          ["Clôturer proprement", "Confirme l'arrivée et laisse un avis si le trajet s'est bien passé."],
        ],
      },
      {
        title: "Après le trajet : l'avis n'est pas décoratif",
        body: "Un avis utile ne cherche pas à juger la personne. Il décrit l'expérience : ponctualité, communication, respect du point de rendez-vous, conduite, ambiance. Cette mémoire permet aux nouvelles utilisatrices de décider plus vite et donne à la communauté une forme de responsabilité partagée.",
      },
    ],
    checklist: [
      "Profil complété avec photo lisible",
      "Trajet simple choisi pour commencer",
      "Point de rendez-vous confirmé par message",
      "Véhicule vérifié avant de monter",
      "Règles du trajet clarifiées",
      "Avis laissé après l'arrivée",
    ],
    sourceKeys: ["covoiturage", "cnil"],
    faqs: [
      ["Faut-il envoyer un message avant le premier trajet ?", "Oui si un détail peut créer une ambiguïté : point de rendez-vous, retard possible, bagage, arrêt ou destination exacte. Un message court suffit."],
      ["Quel trajet choisir pour commencer ?", "Un trajet simple, avec une marge horaire et un point de rendez-vous évident. L'objectif du premier trajet est de comprendre le fonctionnement sans multiplier les imprévus."],
      ["Pourquoi laisser un avis après le trajet ?", "Parce que l'avis aide les prochaines utilisatrices à décider. Il transforme une expérience individuelle en signal de confiance pour la communauté."],
    ],
  },
  {
    slug: "retour-festival-campus-covoiturage",
    category: "Partenaires",
    cluster: "Festivals et campus",
    intent: "Comment organiser les retours d'un festival, d'un campus ou d'une soirée étudiante ?",
    title: "Festival ou campus : comment organiser les retours avec Drive Lady ?",
    metaTitle: "Retour festival et campus : organiser les trajets avec Drive Lady",
    metaDescription: "Méthode concrète pour intégrer Drive Lady dans un festival, un campus ou une soirée étudiante : point pickup, communication, horaires, référent et sécurité.",
    summary: "Un événement réussit mieux ses retours quand la mobilité est pensée avant la sortie. Pour un festival, un campus ou une soirée étudiante, Drive Lady doit être visible dans le parcours : lien, horaires, point pickup, consignes et relais humain.",
    answer: "Pour organiser les retours d'un festival ou d'un campus, il faut décider le point pickup avant l'événement, le rendre visible dans les emails, affiches et stories, recommander des créneaux de départ, nommer un référent sur place et prévoir un canal de signalement. Drive Lady apporte surtout une brique de confiance : profils lisibles, trajets anticipés et retour moins improvisé à la fermeture.",
    stat: {
      number: "2,97 M",
      label: "d'étudiantes et étudiants étaient inscrits dans l'enseignement supérieur en 2023-2024.",
    },
    takeaways: [
      "Le retour doit être intégré au parcours événementiel dès l'annonce.",
      "Un bon point pickup est proche, éclairé, accessible et distinct de la foule.",
      "Le partenaire doit parler de mobilité pratique, pas seulement de sécurité abstraite.",
    ],
    sections: [
      {
        title: "Pourquoi les événements demandent une organisation spécifique",
        body: [
          "À la sortie d'un festival ou d'une soirée de campus, le problème n'est pas seulement de trouver une voiture. C'est de retrouver ses amies, comprendre où aller, éviter les zones saturées, gérer la fatigue, garder de la batterie et partir sans rester seule longtemps.",
          "Drive Lady peut devenir une brique utile si elle est intégrée avant le pic de sortie. Un lien partagé trop tard ou un point de rendez-vous découvert à minuit aura moins d'impact qu'un parcours annoncé dès l'inscription.",
        ],
        table: [
          ["Contexte", "Risque d'organisation", "Réponse Drive Lady"],
          ["Festival", "Foule et réseau saturé", "Point pickup hors flux principal."],
          ["Campus", "Résidences et quartiers dispersés", "Créneaux de retours groupés."],
          ["Bar partenaire", "Fermeture simultanée", "QR code visible avant la sortie."],
          ["Soirée étudiante", "Groupe qui se sépare", "Message de rappel avant la fin."],
        ],
      },
      {
        title: "Choisir le bon point de pickup",
        body: "Le point de pickup ne doit pas être le lieu le plus symbolique. Il doit être le plus compréhensible. Une sortie principale peut sembler évidente, mais devenir inutilisable si elle concentre foule, taxis, livreurs, barrières et bruit.",
        steps: [
          ["Repérer sur plan", "Choisir une zone accessible aux véhicules et facile à expliquer."],
          ["Tester le chemin", "Vérifier qu'une participante peut s'y rendre sans traverser une zone confuse."],
          ["Nommer le repère", "Utiliser un bâtiment, une entrée, une rue ou un parking identifié."],
          ["Communiquer partout", "Mettre le même libellé dans les emails, stories, affiches et écrans."],
        ],
      },
      {
        title: "Le kit de communication partenaire",
        body: [
          "Le message doit être sobre. Il ne faut pas dire aux participantes qu'elles sont en danger ; il faut leur donner une solution lisible pour rentrer. Cette nuance change tout : elle respecte l'expérience des femmes sans instrumentaliser la peur.",
          "Le meilleur contenu partenaire tient en quatre éléments : pourquoi Drive Lady est proposé, comment réserver, où se trouve le point pickup et qui contacter en cas de problème sur place.",
        ],
        list: [
          "Un QR code vers la page ou l'application Drive Lady.",
          "Un visuel du point de rendez-vous.",
          "Deux ou trois horaires de départ recommandés.",
          "Un message de rappel envoyé avant le dernier temps fort.",
          "Un référent identifié côté événement ou campus.",
        ],
      },
      {
        title: "Ce que Drive Lady peut aspirer à devenir pour ces lieux",
        body: "Pour les festivals, campus et lieux de sortie, Drive Lady peut devenir la couche de mobilité féminine qui rend le retour aussi pensé que l'entrée. Ce positionnement est plus fort qu'un simple partenariat logo : il relie communauté, usage concret et responsabilité sans transformer l'événement en discours anxiogène.",
        compare: {
          goodTitle: "Bon partenariat",
          badTitle: "Partenariat faible",
          good: [
            "Drive Lady apparaît avant, pendant et après l'événement.",
            "Le point pickup est nommé et répété.",
            "Le message parle d'organisation, de confiance et de choix.",
          ],
          bad: [
            "Un logo ajouté en bas d'affiche sans explication.",
            "Un lien partagé uniquement après la fermeture.",
            "Un discours qui fait peur sans donner d'action concrète.",
          ],
        },
      },
    ],
    checklist: [
      "Point pickup validé sur plan",
      "Lien Drive Lady intégré aux communications",
      "Créneaux de départ recommandés",
      "Message de rappel programmé",
      "Référent partenaire nommé",
      "Canal signalement et urgence rappelé",
    ],
    sourceKeys: ["festivals", "campus", "vssEsr", "aide"],
    faqs: [
      ["Quand communiquer Drive Lady pour un événement ?", "Avant l'événement, puis à nouveau quelques heures avant la sortie. Un lien découvert au moment de rentrer est beaucoup moins utile qu'une option déjà connue."],
      ["Où placer le point de rendez-vous ?", "Dans une zone proche, éclairée, accessible aux véhicules et distincte du flux principal. Le lieu doit être facile à nommer et identique dans toutes les communications."],
      ["Drive Lady convient-il aux campus ?", "Oui, surtout pour les soirées étudiantes, retours de résidence, stages, gares et événements associatifs. Le campus concentre des trajets récurrents et des horaires atypiques."],
    ],
  },
  {
    slug: "partenariat-marque-securite-femmes",
    category: "Partenaires",
    cluster: "Communication",
    intent: "Comment parler de sécurité des femmes sans faire peur dans une communication partenaire ?",
    title: "Partenariat sécurité femmes : comment parler de Drive Lady sans faire peur ?",
    metaTitle: "Partenariat sécurité femmes : message Drive Lady sans anxiété",
    metaDescription: "Guide de communication pour bars, campus, festivals et marques : parler de Drive Lady avec un message utile, rassurant et non anxiogène.",
    summary: "Le sujet de la sécurité des femmes demande une communication précise. Un partenaire doit reconnaître le besoin sans dramatiser chaque sortie, expliquer l'usage sans promettre l'impossible et donner une action simple.",
    answer: "Pour parler de Drive Lady sans faire peur, le partenaire doit partir de l'usage : rentrer plus facilement, choisir une conductrice, vérifier les informations du trajet et éviter l'improvisation de fin de soirée. Le message doit être concret, calme et orienté action. Il peut reconnaître les situations d'inconfort sans transformer la communication en campagne anxiogène.",
    stat: {
      number: "15 %",
      label: "des outrages sexistes enregistrés par la police nationale ont lieu dans les transports en commun en 2024.",
    },
    takeaways: [
      "Le bon message rassure parce qu'il donne une action, pas parce qu'il dramatise.",
      "Drive Lady doit être présenté comme une option de mobilité et de confiance.",
      "Les partenaires crédibles assument les limites et rappellent les urgences officielles.",
    ],
    sections: [
      {
        title: "La ligne éditoriale : reconnaître, puis rendre actionnable",
        body: [
          "Une communication partenaire échoue quand elle tombe dans l'un des deux extrêmes : minimiser les situations vécues par les femmes ou faire de chaque sortie un danger. Drive Lady doit occuper une troisième voie : reconnaître le besoin, puis proposer un geste simple.",
          "La phrase centrale peut être très courte : « Pour ton retour, Drive Lady te permet de réserver un trajet entre femmes avec des informations visibles avant le départ. » Elle dit l'usage, la cible et le bénéfice sans exagérer.",
        ],
        compare: {
          goodTitle: "À dire",
          badTitle: "À éviter",
          good: [
            "Prépare ton retour avant la fin de la soirée.",
            "Choisis un trajet entre femmes avec des informations visibles.",
            "Retrouve le point pickup indiqué par l'événement.",
          ],
          bad: [
            "Ne rentre jamais seule.",
            "Avec Drive Lady, il ne peut rien arriver.",
            "Les transports sont dangereux, prends notre solution.",
          ],
        },
      },
      {
        title: "Les quatre composants d'un message partenaire",
        body: "Un message partenaire doit pouvoir tenir sur une affiche, une story, un email ou un écran sur place. Plus il est simple, plus il a de chances d'être utilisé au bon moment.",
        steps: [
          ["Contexte", "Pourquoi Drive Lady est proposé ici : retour tardif, événement, campus, lieu de sortie."],
          ["Action", "Ce que la personne doit faire : scanner, réserver, rejoindre le point pickup."],
          ["Repère", "Où et quand le service est le plus utile : horaires, lieu, QR code."],
          ["Limite", "Rappel sobre : en urgence, appeler les canaux officiels."],
        ],
      },
      {
        title: "Adapter le ton selon le partenaire",
        body: [
          "Un bar, une école, une association étudiante et un festival ne parlent pas de la même façon. Mais le fond reste identique : Drive Lady n'est pas un gadget de communication. C'est un service qui doit rendre le retour plus lisible.",
          "L'adaptation se fait sur le vocabulaire, pas sur la promesse. Le partenaire peut être chaleureux, institutionnel ou communautaire ; il ne doit jamais promettre une sécurité absolue.",
        ],
        table: [
          ["Partenaire", "Angle utile", "Message court"],
          ["Bar ou lieu de soirée", "Retour après fermeture", "Prépare ton retour avant le dernier verre."],
          ["Campus", "Vie étudiante et horaires tardifs", "Rentre avec une option pensée pour les étudiantes."],
          ["Festival", "Foule et point pickup", "Retrouve le point Drive Lady indiqué sur le plan."],
          ["Association", "Relais de confiance", "Partage une solution concrète à ta communauté."],
        ],
      },
      {
        title: "Pourquoi cette rigueur sert aussi le SEO et les IA",
        body: "Les contenus citables par Google et les IA répondent clairement à une question, donnent des étapes, citent leurs sources et évitent les promesses floues. C'est aussi la bonne manière de construire la marque Drive Lady : moins de slogans, plus d'utilité vérifiable.",
      },
    ],
    checklist: [
      "Question utilisateur clairement identifiée",
      "Message orienté action",
      "Promesse non absolue",
      "Point pickup ou lien visible",
      "Canaux d'urgence rappelés",
      "Ton adapté au partenaire",
    ],
    sourceKeys: ["outrages", "vssEsr", "aide"],
    faqs: [
      ["Comment parler de sécurité sans être anxiogène ?", "En partant de l'action concrète : préparer son retour, choisir une option lisible, vérifier les informations et savoir quoi faire si le plan change. Le message doit reconnaître le besoin sans amplifier la peur."],
      ["Un partenaire peut-il promettre que Drive Lady sécurise tout ?", "Non. Il doit présenter Drive Lady comme une option de mobilité et de confiance, pas comme une garantie absolue. Les urgences et signalements officiels restent indispensables."],
      ["Quel CTA utiliser ?", "Un CTA simple et direct : « Préparer mon retour », « Réserver un trajet », « Voir le point Drive Lady » ou « Rejoindre la communauté ». Le CTA doit correspondre au contexte réel."],
    ],
  },
];

function renderPage({ title, description, body, depth = 0 }) {
  const prefix = depth === 0 ? "." : depth === 1 ? ".." : "../..";
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}"/>
  <meta name="theme-color" content="#f8b6de"/>
  <link rel="icon" href="${prefix}/assets/drive-lady-app-icon.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="${prefix}/styles.css"/>
  <link rel="stylesheet" href="${prefix}/pages.css"/>
</head>
<body>
  <a class="skip-link" href="#main">Aller au contenu</a>
  <div class="page-stage">
    <div class="site-frame">
      ${renderHeader()}
      ${body}
      ${renderFooter()}
    </div>
  </div>
  <script src="${prefix}/script.js"></script>
</body>
</html>`;
}

function renderHeader() {
  return `<header class="site-header" data-header>
  <nav class="nav-shell" aria-label="Navigation principale">
    <a class="brand" href="/" aria-label="Drive Lady accueil"><img src="/assets/drive-lady-logo.png" alt="Logo Drive Lady"/><span>Drive Lady</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-button><span></span><span></span><span></span><span class="sr-only">Ouvrir le menu</span></button>
    <div class="nav-links" id="site-menu" data-menu>
      <div class="nav-dropdown" data-nav-dropdown><button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="nav-disc" data-nav-dropdown-trigger>Découvrir<svg class="nav-dropdown__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-dropdown__menu" id="nav-disc"><a href="/comment-ca-marche/">Comment ça marche</a><a href="/trajets/">Trajets</a><a href="/securite/">Sécurité</a><a href="/faq/">FAQ</a></div></div>
      <div class="nav-dropdown" data-nav-dropdown><button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="nav-part" data-nav-dropdown-trigger>Partenaires<svg class="nav-dropdown__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-dropdown__menu" id="nav-part"><a href="/evenements/">Événements</a><a href="/bars-lieux-de-soiree/">Bars et lieux de soirée</a><a href="/festivals-campus/">Festivals et campus</a><a href="/devenir-partenaire/">Devenir partenaire</a></div></div>
      <a href="/blog/" aria-current="page">Blog</a>
      <div class="nav-dropdown" data-nav-dropdown><button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="nav-about" data-nav-dropdown-trigger>À propos<svg class="nav-dropdown__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-dropdown__menu" id="nav-about"><a href="/notre-mission/">Notre mission</a><a href="/notre-equipe/">Notre équipe</a><a href="/nous-rejoindre/">Nous rejoindre</a><a href="/presse/">Presse</a><a href="/histoire-drive-lady/">L'histoire de Drive Lady</a></div></div>
      <div class="nav-dropdown" data-nav-dropdown><button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="nav-contact" data-nav-dropdown-trigger>Contact<svg class="nav-dropdown__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-dropdown__menu" id="nav-contact"><a href="/nous-ecrire/">Nous écrire</a><a href="/contact-partenaires/">Contact partenaires</a><a href="/signalement/">Faire un signalement</a><a href="/support/">Support</a></div></div>
    </div>
    <a class="nav-cta" href="https://app-drivelady.fr/">Rejoindre la communauté</a>
  </nav>
</header>`;
}

function renderFooter() {
  return `<footer class="footer"><div class="footer__inner"><div class="footer__top"><div class="footer__brand"><a class="footer__logo" href="/"><img src="/assets/drive-lady-logo.png" alt="Logo Drive Lady"/><span>Drive Lady</span></a><p>Le covoiturage entre femmes pensé pour les trajets du quotidien, les retours tardifs et les déplacements où la confiance doit rester visible.</p></div><nav class="footer__links"><div class="footer__column"><h2>Découvrir</h2><ul><li><a href="/comment-ca-marche/">Comment ça marche</a></li><li><a href="/trajets/">Trajets</a></li><li><a href="/securite/">Sécurité</a></li><li><a href="/faq/">FAQ</a></li></ul></div><div class="footer__column"><h2>Partenaires</h2><ul><li><a href="/evenements/">Événements</a></li><li><a href="/bars-lieux-de-soiree/">Bars et lieux de soirée</a></li><li><a href="/festivals-campus/">Festivals et campus</a></li><li><a href="/devenir-partenaire/">Devenir partenaire</a></li></ul></div><div class="footer__column"><h2>À propos</h2><ul><li><a href="/notre-mission/">Notre mission</a></li><li><a href="/notre-equipe/">Notre équipe</a></li><li><a href="/nous-rejoindre/">Nous rejoindre</a></li><li><a href="/presse/">Presse</a></li><li><a href="/histoire-drive-lady/">L'histoire de Drive Lady</a></li></ul></div><div class="footer__column"><h2>Contact</h2><ul><li><a href="/nous-ecrire/">Nous écrire</a></li><li><a href="/contact-partenaires/">Contact partenaires</a></li><li><a href="/signalement/">Faire un signalement</a></li><li><a href="/support/">Support</a></li></ul></div></nav></div><div class="footer__bottom"><p>Copyright &copy; <span data-current-year>2026</span> Drive Lady. Tous droits réservés.</p><p class="footer__credit">Réalisé avec <span class="footer__heart" aria-hidden="true">&hearts;</span> par l'agence digitale <a href="https://scaly.co" target="_blank" rel="noreferrer noopener">Scaly</a></p><div class="footer__legal"><a href="/mentions-legales/">Mentions légales</a><a href="/conditions-generales-utilisation/">CGU</a><a href="/conditions-generales-de-vente/">CGV</a><a href="/politique-de-confidentialite/">Confidentialité</a></div></div></div></footer>`;
}

function renderBlogIndex() {
  const body = `<main id="main" class="blog-index-main">
  <section class="blog-masthead" id="top" aria-labelledby="blog-title">
    <div class="blog-masthead__copy">
      <p class="eyebrow">Blog Drive Lady</p>
      <h1 id="blog-title">Guides, sécurité et vie de communauté.</h1>
      <p>Des conseils concrets pour préparer un retour, organiser un trajet, rejoindre une conductrice ou accompagner un événement avec plus de clarté.</p>
    </div>
  </section>

  <section class="blog-directory" id="articles" aria-labelledby="articles-title">
    <div class="blog-directory__header">
      <p class="eyebrow">Tous les guides</p>
      <h2 id="articles-title">Articles Drive Lady</h2>
      <p>Chaque contenu répond à une intention simple : préparer un retour, comprendre la confiance, aider un partenaire ou rassurer une nouvelle utilisatrice.</p>
    </div>
    <div class="blog-directory__layout" data-blog-filters>
      <aside class="blog-filter-sidebar" aria-label="Recherche des guides">
        <label class="blog-search-label" for="blog-search">Rechercher un guide</label>
        <div class="blog-search-field">
          <span aria-hidden="true"></span>
          <input id="blog-search" type="search" placeholder="Sujet, trajet, sécurité..." autocomplete="off" data-blog-search/>
        </div>
        <p class="blog-filter-count" aria-live="polite"><strong data-blog-result-number>${articles.length}</strong><span data-blog-result-label> guides trouvés</span></p>
      </aside>
      <div class="blog-directory__results">
        <div class="blog-grid">
          ${articles.map(renderArticleCard).join("")}
        </div>
        <div class="blog-filter-empty" data-blog-empty hidden>
          <strong>Aucun guide trouvé</strong>
          <p>Essaie un autre mot-clé ou réinitialise les filtres.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="faq-contact-band" aria-labelledby="blog-cta-title">
    <p class="eyebrow">À mettre en avant</p>
    <h2 id="blog-cta-title">Préparer son trajet devient plus simple.</h2>
    <p>Retrouve les conseils utiles pour choisir ton horaire, vérifier les informations importantes, organiser un retour de groupe ou proposer Drive Lady lors d'un événement.</p>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <a class="button button--primary" href="https://app-drivelady.fr/">Rejoindre la communauté</a>
      <a class="button button--secondary" href="/securite/">Voir la sécurité</a>
    </div>
  </section>
</main>`;

  return renderPage({
    title: "Blog Drive Lady | Guides utiles sécurité, trajets et partenaires",
    description: "Six guides Drive Lady sourcés et actionnables pour préparer un retour, vérifier un profil, réussir un premier trajet ou accompagner un événement.",
    body,
    depth: 1,
  });
}

function renderArticleCard(article) {
  const author = articleAuthor(article);
  const searchText = [article.title, article.summary, article.intent, article.category, article.cluster, author.name].join(" ");
  return `<article class="blog-post-card" data-blog-card data-blog-category="${normalizeId(article.category)}" data-blog-search="${escapeHtml(searchText)}">
    <a href="/blog/${article.slug}/" aria-label="Lire ${escapeHtml(article.title)}">
      <img class="blog-post-card__image" src="${articleImage(article)}" alt="${escapeHtml(articleImageAlt(article))}" loading="lazy"/>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.summary)}</p>
      <div class="blog-post-card__author">
        <img src="${author.image}" alt="" loading="lazy"/>
        <span>Par <strong>${escapeHtml(author.name)}</strong></span>
      </div>
      <div class="blog-post-card__meta"><span>${articleReadingTime(article)}</span></div>
    </a>
  </article>`;
}

function renderArticle(article) {
  const author = articleAuthor(article);
  const related = articles
    .filter((candidate) => candidate.slug !== article.slug && (candidate.category === article.category || candidate.cluster === article.cluster))
    .slice(0, 3);
  const articleUrl = `${siteUrl}/blog/${article.slug}/`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDescription,
      datePublished: today,
      dateModified: today,
      author: { "@type": "Person", name: author.name },
      publisher: { "@type": "Organization", name: "Drive Lady", logo: { "@type": "ImageObject", url: `${siteUrl}/assets/drive-lady-logo.png` } },
      image: `${siteUrl}${articleImage(article)}`,
      mainEntityOfPage: articleUrl,
      inLanguage: "fr-FR",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
        { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];

  const body = `<main id="main" class="blog-article-main">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <article class="blog-article">
    <header class="article-hero">
      <nav class="article-breadcrumb" aria-label="Fil d'Ariane">
        <a href="/">Accueil</a>
        <span aria-hidden="true">/</span>
        <a href="/blog/">Blog</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${escapeHtml(article.title)}</span>
      </nav>
      <div class="article-hero__grid">
        <div>
          <p class="eyebrow">${escapeHtml(article.category)} · ${escapeHtml(article.cluster)}</p>
          <h1>${escapeHtml(article.title)}</h1>
          <p class="article-hero__lead">${escapeHtml(article.summary)}</p>
          <div class="article-author">
            <img src="${author.image}" alt="" loading="lazy"/>
            <div>
              <span>Rédigé par</span>
              <strong>${escapeHtml(author.name)}</strong>
              <small>${escapeHtml(author.role)}</small>
            </div>
          </div>
          <div class="article-meta"><span>${formatDate(today)}</span><span>${articleReadingTime(article)}</span></div>
        </div>
        <div class="article-hero__aside">
          <figure class="article-hero__visual">
            <img src="${articleImage(article)}" alt="${escapeHtml(articleImageAlt(article))}" loading="eager"/>
          </figure>
        </div>
      </div>
    </header>

    <div class="article-layout">
      <aside class="article-sidebar" aria-label="Sommaire de l'article">
        <strong>Sommaire</strong>
        <a href="#probleme">Comprendre le besoin</a>
        <a href="#methode">Méthode pratique</a>
        <a href="#checklist">Checklist</a>
        <a href="#sources">Sources</a>
        <a href="#faq">FAQ</a>
        <a href="#a-retenir">À retenir</a>
      </aside>

      <div class="article-content">
        <section id="probleme" class="article-intro">
          <p class="article-chapo">${escapeHtml(article.answer)}</p>
          <div class="article-source-note">
            <strong>Pourquoi ce sujet compte</strong>
            <p>${renderSourceFacts(article)}</p>
          </div>
        </section>

        <section id="methode">
          ${article.sections.map(renderSection).join("")}
        </section>

        <section id="checklist" class="article-checklist">
          <p class="eyebrow">Checklist Drive Lady</p>
          <h2>Avant de valider le trajet</h2>
          <div class="article-checklist__grid">
            ${article.checklist.map((item, index) => `<label class="article-checklist__item"><input type="checkbox" name="checklist-${article.slug}" value="${index + 1}"/><span>${escapeHtml(item)}</span></label>`).join("")}
          </div>
        </section>

        <section class="article-citation" id="sources">
          <p class="eyebrow">Sources officielles</p>
          <h2>Les références utilisées</h2>
          <ul>${article.sourceKeys.map((key) => `<li><a href="${sources[key].url}" target="_blank" rel="noreferrer noopener">${escapeHtml(sources[key].label)}</a><span>${escapeHtml(sources[key].fact)}</span></li>`).join("")}</ul>
        </section>

        <section id="faq" class="article-faq">
          <p class="eyebrow">FAQ</p>
          <h2>Questions fréquentes</h2>
          ${article.faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("")}
        </section>

        <section id="a-retenir" class="article-takeaways">
          <p class="eyebrow">À retenir</p>
          <h2>L'essentiel avant de partir</h2>
          <ul>${article.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>

        <section class="article-next">
          <div>
            <p class="eyebrow">Continuer</p>
            <h2>Articles liés</h2>
          </div>
          <div class="article-next__grid">
            ${related.map((item) => `<a href="/blog/${item.slug}/"><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.title)}</strong></a>`).join("")}
          </div>
        </section>
      </div>
    </div>
  </article>
</main>`;

  return renderPage({
    title: article.metaTitle,
    description: article.metaDescription,
    body,
    depth: 2,
  });
}

function renderSection(section, index) {
  const id = index === 0 ? "section-principale" : `section-${index + 1}`;
  return `<section class="article-section" id="${id}">
    <h2>${escapeHtml(section.title)}</h2>
    ${renderParagraphs(section.body)}
    ${section.steps ? renderSteps(section.steps) : ""}
    ${section.list ? `<ul class="article-list">${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
    ${section.table ? renderTable(section.table) : ""}
    ${section.compare ? renderCompare(section.compare) : ""}
  </section>`;
}

function renderParagraphs(body) {
  const paragraphs = Array.isArray(body) ? body : [body];
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderSteps(steps) {
  return `<ul class="article-list">${steps.map(([title, text], index) => `<li>${index + 1}. ${escapeHtml(title)} — ${escapeHtml(text)}</li>`).join("")}</ul>`;
}

function renderCompare(compare) {
  const rows = [[compare.goodTitle || "À faire", compare.badTitle || "À éviter"]];
  const length = Math.max(compare.good.length, compare.bad.length);

  for (let index = 0; index < length; index += 1) {
    rows.push([compare.good[index] || "", compare.bad[index] || ""]);
  }

  return renderTable(rows);
}

function articleImage(article) {
  const images = {
    "retour-soiree-securite-femmes": "/assets/journey-night.png",
    "harcelement-transports-retour-femmes": "/assets/site-stat-insecure.png",
    "profil-verifie-covoiturage-femmes": "/assets/site-stat-safe.png",
    "premier-trajet-drive-lady": "/assets/journey-daily.png",
    "retour-festival-campus-covoiturage": "/assets/journey-weekend.png",
    "partenariat-marque-securite-femmes": "/assets/partner-cosmo.avif",
  };

  return images[article.slug] || defaultBlogImage;
}

function articleImageAlt(article) {
  return `Visuel Drive Lady pour ${article.title}`;
}

function articleAuthor(article) {
  return authors[article.authorKey || authorByCategory[article.category] || "camille"];
}

function renderTable(rows) {
  const [head, ...body] = rows;
  return `<div class="article-table-wrap"><table class="article-table"><thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderSourceFacts(article) {
  return article.sourceKeys.map((key) => escapeHtml(sources[key].fact)).join(" ");
}

function articleReadingTime(article) {
  const words = [
    article.title,
    article.intent,
    article.summary,
    article.answer,
    article.stat.number,
    article.stat.label,
    ...article.takeaways,
    ...article.sections.flatMap((section) => [
      section.title,
      ...(Array.isArray(section.body) ? section.body : [section.body]),
      ...(section.list || []),
      ...((section.table || []).flat()),
      ...((section.steps || []).flat()),
      ...(section.compare ? [section.compare.goodTitle, section.compare.badTitle, ...section.compare.good, ...section.compare.bad] : []),
    ]),
    ...article.checklist,
    ...article.faqs.flat(),
  ].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(5, Math.ceil(words / 180))} min`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

function normalizeId(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pruneBlogDirectory(blogDirectory) {
  mkdirSync(blogDirectory, { recursive: true });
  const activeSlugs = new Set(articles.map((article) => article.slug));

  for (const entry of readdirSync(blogDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || activeSlugs.has(entry.name)) {
      continue;
    }

    const directory = path.join(blogDirectory, entry.name);
    const resolved = path.resolve(directory);
    const resolvedBlog = path.resolve(blogDirectory);

    if (!resolved.startsWith(`${resolvedBlog}${path.sep}`)) {
      throw new Error(`Refusing to delete outside blog directory: ${resolved}`);
    }

    rmSync(resolved, { recursive: true, force: true });
  }
}

const blogDirectory = path.join(process.cwd(), "blog");
pruneBlogDirectory(blogDirectory);
writeFileSync(path.join(blogDirectory, "index.html"), renderBlogIndex(), "utf8");

for (const article of articles) {
  const directory = path.join(blogDirectory, article.slug);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "index.html"), renderArticle(article), "utf8");
}

console.log(`Generated ${articles.length} Drive Lady blog articles.`);
