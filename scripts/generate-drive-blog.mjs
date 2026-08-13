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
  nuitFemmes: {
    label: "OpinionWay pour Lime, Les femmes urbaines et le sentiment d'insécurité dans les villes la nuit (juin 2024)",
    url: "https://www.opinion-way.com/wp-content/uploads/2025/01/OpinionWay-pour-Lime-Les-femmes-urbaines-et-le-sentiment-dinsecurite-dans-les-villes-la-nuit-Juin-2024.pdf",
    fact: "87 % des femmes urbaines aimeraient davantage de mesures pour pouvoir se déplacer seules et en sécurité lorsqu'il fait nuit ; 77 % déclarent ne pas se sentir libres de se déplacer seules comme elles le souhaitent lorsqu'il fait nuit.",
  },
  sortiesCulturelles: {
    label: "Ministère de la Culture, DEPS, Les sorties culturelles des Français en 2024",
    url: "https://www.culture.gouv.fr/mc/content/download/391055/file/Chiffres%20cl%C3%A9s%202025_DEPS_Les%20sorties%20culturelles%20des%20Francais%20en%202024_Fiche.pdf?inLanguage=fre-FR&version=1",
    fact: "36 % des Français déclarent avoir assisté à un concert en 2024, contre 24 % en 2023.",
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
    metaDescription: "Méthode pratique pour préparer un retour de soirée plus rassurant : horaire, point de rendez-vous, profil vérifié et réflexes d'urgence.",
    summary: "Un retour de soirée sûr se décide avant que le groupe soit fatigué, séparé ou pressé. La bonne méthode consiste à choisir une heure, nommer un point de rendez-vous visible, vérifier les informations du trajet et garder une solution de repli.",
    answer: "Pour rentrer de soirée avec moins de stress, fixe ton heure de départ avant la fin de l'événement, choisis un point de rendez-vous éclairé et facile à expliquer, vérifie l'identité et le véhicule de la conductrice, puis garde les numéros d'urgence accessibles. L'objectif n'est pas de tout contrôler, mais de supprimer les décisions floues au moment où tu es la moins disponible.",
    answerExtra: [
      "Rentrer de soirée, ce n'est pas seulement « trouver un moyen de transport ». C'est aussi pouvoir profiter de sa soirée sans passer la dernière heure à calculer : « Qui rentre par où ? Est-ce qu'il y a encore des transports ? Est-ce que je vais devoir rentrer seule ? »",
      "Chez Drive Lady, on pense que le retour fait partie de la soirée. Et qu'il mérite d'être anticipé avec autant de soin que le choix de la tenue, du lieu ou des personnes avec qui l'on sort.",
    ],
    sourceNote: "87 % des femmes urbaines aimeraient davantage de mesures pour pouvoir se déplacer seules et en sécurité lorsqu'il fait nuit. 77 % des femmes urbaines déclarent ne pas se sentir libres de se déplacer seules comme elles le souhaitent lorsqu'il fait nuit.",
    stat: {
      number: "87 %",
      label: "des femmes urbaines aimeraient davantage de mesures pour pouvoir se déplacer seules et en sécurité lorsqu'il fait nuit.",
    },
    takeaways: [
      "L'heure de départ doit être décidée avant la fatigue, pas au moment de sortir.",
      "Le point de rendez-vous doit être visible, éclairé et distinct de la foule.",
      "Drive Lady doit rester une option de confiance, jamais un substitut aux urgences.",
    ],
    sections: [
      {
        title: "Pourquoi le dernier quart d'heure est le plus risqué pour l'organisation ?",
        body: [
          "Le problème d'un retour de soirée vient rarement d'un manque de volonté. Il vient d'une accumulation de micro-décisions prises trop tard : une amie part avant les autres, le téléphone passe sous les 10 %, le réseau devient mauvais, le lieu ferme, la rue se remplit et personne ne sait exactement qui rentre avec qui.",
          "Une application comme Drive Lady aide donc à déplacer la décision en amont. Quand l'heure, le lieu de départ, la conductrice et l'itinéraire sont déjà lisibles, le retour demande moins d'énergie. C'est ce qui transforme une promesse de sécurité en usage concret.",
        ],
        steps: [
          ["Choisir l'heure cible", "Décide l'heure de départ avant le début de la soirée ou au moment où le programme devient clair."],
          ["Nommer le point de rendez-vous", "Utilise un repère stable : pharmacie, hall d'hôtel, entrée latérale, parking identifié, arrêt éclairé."],
          ["Vérifier le trajet", "Relis le prénom, la plaque, le modèle du véhicule, la destination, l'heure de départ et le nombre de passagères."],
          ["Partager l'information", "Envoie l'heure, le point de départ et l'arrivée à une proche si tu en ressens le besoin."],
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
          ["Contact", "Partage du trajet ou message à une proche", "Adapte la situation selon ton besoin pour être rassurée."],
        ],
      },
      {
        title: "Prévoir, ce n'est pas renoncer à la spontanéité",
        body: [
          "On associe souvent l'anticipation à quelque chose de contraignant. Pourtant, prévoir son retour permet justement d'être plus libre pendant la soirée. On sait que l'on a une solution, ou au moins que l'on a cherché les options possibles avant de se retrouver dehors à minuit.",
          "Drive Lady ne remplace pas toutes les solutions de mobilité. Elle en ajoute une, plus adaptée à certaines situations : soirées, événements, campus, retours tardifs, trajets entre amies ou covoiturages depuis des lieux partenaires.",
        ],
      },
      {
        title: "Ce que Drive Lady apporte",
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
    afterChecklist: [
      {
        title: "Le covoiturage entre femmes comme solution de retour",
        body: [
          "Drive Lady permet alors de mettre en relation des femmes qui se déplacent au même moment, vers une même zone ou depuis un même événement. L'idée n'est pas de promettre que tout sera toujours disponible partout, tout le temps. L'idée est de créer une alternative supplémentaire, pensée pour les usages réels des femmes.",
          "Quand une conductrice propose un trajet, elle peut permettre à une ou plusieurs passagères de ne pas rentrer seules. Quand une passagère réserve, elle rejoint une femme vérifiée, avec un trajet clair et un cadre défini.",
          "C'est simple, mais ça change beaucoup : le retour n'est plus une question improvisée à la sortie. Il devient une étape organisée de la soirée.",
        ],
      },
    ],
    sourceKeys: ["nuitFemmes", "aide"],
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
    summary: [
      "Pour beaucoup de femmes, se déplacer implique parfois de calculer son trajet autrement : éviter certaines stations, changer d'itinéraire, appeler quelqu'un en marchant, rester près d'un groupe, attendre dans une zone éclairée ou renoncer à sortir trop tard.",
      "Ces habitudes ne devraient pas être banales. Pourtant, elles font partie du quotidien de nombreuses femmes.",
    ],
    answer: "Pour rentrer plus sereinement, l'idéal est d'anticiper son trajet avant le départ : vérifier les horaires, repérer un point de rendez-vous facile à identifier, prévenir une proche si besoin et garder en tête les dispositifs de signalement disponibles. Le covoiturage entre femmes peut alors devenir une option complémentaire rassurante, notamment lorsque l'on souhaite connaître à l'avance le profil de la personne, le lieu de départ et les conditions du trajet.",
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
        body: "Le covoiturage entre femmes n'a pas vocation à remplacer tous les transports. Il devient pertinent quand l'utilisatrice cherche une information plus lisible sur la personne avec qui elle rentre, l'heure de départ, le point de rencontre et le trajet exact.",
        table: [
          ["Situation", "Alternative à préparer", "Point de vigilance"],
          ["Dernier transport incertain", "Trajet Drive Lady réservé plus tôt", "Ne pas attendre la fermeture du lieu."],
          ["Correspondance longue", "Rencontre près d'un repère éclairé", "Éviter les zones sans personnel."],
          ["Retour après concert", "Point à l'écart du flux principal", "Nommer le lieu dans le groupe."],
          ["Marche finale isolée", "Dépose plus proche ou accompagnée", "Partager l'heure d'arrivée."],
        ],
      },
      {
        body: "Le bon discours de Drive Lady doit donc tenir deux idées ensemble : proposer une option plus confortable pour rentrer, et rappeler que les violences sexistes et sexuelles relèvent de dispositifs officiels lorsqu'elles surviennent.",
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
        title: "Les bons réflexes en cas de situation inconfortable à adopter",
        body: [
          "Les bons réflexes à adopter si vous êtes témoin d'une agression : prévenez du monde autour de vous, appelez immédiatement la police ou la gendarmerie et assurez-vous que la victime se porte bien. Appelez les secours (pompiers, SAMU) : au-delà des violences physiques subies, les violences verbales et psychologiques existent.",
          "Si vous êtes victime ou témoin d'une situation de harcèlement ou de violence dans les transports, des dispositifs existent. Dans les transports ferroviaires, bus ou métros RATP (en Île-de-France), il est possible de contacter le 3117 ou d'envoyer un SMS au 31177 pour demander l'assistance de la SNCF, de la RATP ou des forces de l'ordre.",
          "Prévoir une alternative de retour ne remplace évidemment pas ces dispositifs. Mais cela peut faire partie d'une organisation plus globale : savoir comment l'on rentre, avec qui, depuis quel point, et quoi faire si l'option initiale ne fonctionne plus.",
        ],
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
    summary: "Réserver un covoiturage, ce n'est pas seulement choisir un horaire et un prix. C'est aussi choisir une personne avec qui l'on va partager un trajet, parfois de nuit, parfois depuis un lieu que l'on ne connaît pas, parfois seule.",
    answer: "Un profil de covoiturage devient plus rassurant quand plusieurs signaux se recoupent : identité vérifiée, photo cohérente, véhicule renseigné, plaque visible avant le départ, avis publiés, historique de trajets et échange clair sur le point de rendez-vous. Aucun badge ne garantit tout ; la confiance vient de la cohérence des informations et d'un signalement facile si quelque chose ne va pas.",
    answerExtra: [
      "Sur la plateforme, les profils sont vérifiés afin de créer un cadre plus rassurant pour les utilisatrices. Mais au-delà de la vérification, certains signaux peuvent vous aider à réserver plus sereinement.",
    ],
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
          "Un profil rassurant est généralement un profil complet : prénom, photo, informations cohérentes, trajet bien renseigné, horaire précis, nombre de places disponibles, lieu de départ et d'arrivée clairement indiqués.",
        ],
        steps: [
          ["Qui est la conductrice ?", "Prénom, photo, vérification et ancienneté doivent être lisibles sans fouiller l'écran."],
          ["Quel véhicule arrive ?", "Modèle, couleur et plaque évitent les confusions au point de rendez-vous."],
          ["Que dit l'historique ?", "Des avis récents et précis reflètent un trajet en toute confiance."],
        ],
      },
      {
        title: "La vérification : une première base de confiance",
        body: [
          "Sur Drive Lady, les comptes sont vérifiés afin de renforcer la sécurité de la communauté. Cette étape permet de créer un cadre plus sérieux qu'une simple mise en relation informelle sur un groupe ou une conversation privée.",
          "La vérification ne doit pas être vue comme une formalité administrative. Elle fait partie de l'ADN de Drive Lady : permettre aux femmes de covoiturer dans un environnement pensé pour elles, avec des profils identifiés et une communauté encadrée.",
        ],
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
    afterChecklist: [
      {
        title: "Réserver, oui. Mais réserver en étant informée.",
        body: [
          "Un bon covoiturage commence avant de monter dans la voiture. Il commence avec un profil vérifié, un trajet clair, une communication simple et une confiance progressive.",
          "Drive Lady a été pensée pour faciliter cette mise en relation entre femmes, mais chaque utilisatrice garde un rôle essentiel : regarder, poser les bonnes questions, signaler si nécessaire, et contribuer à une communauté fiable.",
        ],
      },
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
    answer: "Le premier trajet est souvent celui qui soulève le plus de questions.",
    answerExtra: [
      "Où se retrouver ? Que faut-il vérifier ? Comment se passe le paiement ? Est-ce que je dois envoyer un message avant ? Est-ce que je peux proposer un trajet même si je ne connais pas encore bien la plateforme ?",
      "Bonne nouvelle : un premier trajet Drive Lady se prépare simplement. L'objectif est que chacune se sente à l'aise, que ce soit comme passagère ou comme conductrice.",
    ],
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
        title: "Les petits détails qui rassurent tout le monde",
        body: "Un premier trajet se passe souvent mieux quand les choses sont clairement posées.",
        list: [
          "Confirmer l'heure.",
          "Définir un point de rendez-vous visible.",
          "Prévenir en cas de retard.",
          "Vérifier la destination.",
          "Rester joignable avant le départ.",
        ],
        outro: "Ces réflexes peuvent paraître évidents, mais ils évitent la majorité des petits stress de dernière minute.",
      },
      {
        title: "Passagère : ce qu'il faut vérifier",
        body: "La passagère n'a pas besoin d'un manuel. Elle a besoin d'une courte séquence de décision : est-ce le bon profil, le bon véhicule, le bon lieu et le bon trajet ?",
        table: [
          ["Moment", "Action", "Message recommandé"],
          ["Avant réservation", "Lire profil, avis, trajet", "Je vérifie que le trajet correspond à mon besoin."],
          ["Après confirmation", "Envoyer une précision si besoin", "Bonjour, je serai devant l'entrée côté pharmacie à 23 h 10."],
          ["Au départ", "Comparer la plaque et le modèle indiqués", "Je monte uniquement si les informations correspondent."],
          ["Après arrivée", "Laisser un avis factuel", "Ponctualité, communication, respect du trajet."],
        ],
      },
      {
        title: "Conductrice : poser un cadre sans être rigide",
        body: [
          "La conductrice rassure quand elle annonce simplement ce qui est possible et ce qui ne l'est pas : heure de départ, retard accepté, détour, bagage, musique, place disponible et point exact de prise en charge.",
          "Le bon ton n'est ni autoritaire ni flou. Il donne des repères. C'est précisément ce qui permet à Drive Lady d'aspirer à une communauté fiable plutôt qu'à une simple marketplace de sièges libres.",
          "Privilégiez un lieu de rendez-vous simple à identifier : entrée principale d'un lieu, parking, gare, arrêt connu, devanture visible. Plus le point est clair, plus le départ est fluide.",
          "Si une passagère vous écrit, répondez de façon simple et précise. Cela permet de créer un climat de confiance avant même le trajet.",
        ],
        steps: [
          ["Créer le trajet", "Renseigne l'itinéraire, l'heure, le véhicule et les arrêts possibles."],
          ["Confirmer les demandes", "Vérifie que chaque passagère comprend le point de départ."],
          ["Prévenir en cas de retard", "Un message court suffit : nouvelle heure, raison, option d'ajustement."],
          ["Clôturer proprement", "Confirme l'arrivée et laisse un avis si le trajet s'est bien passé."],
        ],
      },
      {
        title: "Après le trajet : l'avis n'est pas décoratif",
        body: [
          "Un avis utile ne cherche pas à juger la personne. Il décrit l'expérience : ponctualité, communication, respect du point de rendez-vous, conduite, ambiance. Cette mémoire permet aux nouvelles utilisatrices de décider plus vite et donne à la communauté une forme de responsabilité partagée.",
          "Une fois le trajet terminé, prenez quelques instants pour laisser un avis si la fonctionnalité est disponible. Cela aide les prochaines utilisatrices et contribue à renforcer la confiance au sein de la communauté.",
          "Un commentaire simple suffit : trajet agréable, conductrice ponctuelle, passagère respectueuse, bonne communication. Chaque retour compte.",
        ],
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
    afterChecklist: [
      {
        title: "Le premier trajet, c'est le début de la communauté",
        body: [
          "Drive Lady n'est pas seulement un outil pour aller d'un point A à un point B. C'est une manière de rendre les déplacements plus solidaires, plus accessibles et plus adaptés aux besoins des femmes.",
          "Alors, que vous soyez passagère ou conductrice, votre premier trajet compte. Il permet à une autre femme de sortir, rentrer, étudier, travailler ou profiter d'un événement avec une solution en plus.",
        ],
      },
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
    summary: "Un événement anticipe mieux ses retours quand la mobilité est pensée avant la sortie. Pour un festival, un campus ou une soirée étudiante, Drive Lady doit être visible dans le parcours : lien, horaires, point pickup, consignes et relais humain.",
    answer: "Un festival, un campus, une soirée étudiante, un concert, un afterwork ou un événement associatif ont souvent un point commun : tout le monde arrive à peu près au même endroit, mais personne ne rentre exactement de la même façon.",
    answerExtra: [
      "Certaines participantes ont une voiture. D'autres dépendent des transports. Certaines dorment sur place. D'autres doivent rentrer dans une ville voisine, parfois tard, parfois seules.",
      "C'est précisément dans ces moments que Drive Lady devient utile.",
    ],
    sourceNote: "36 % des Français déclarent avoir assisté à un concert en 2024, contre 24 % en 2023 : les sorties reprennent fortement, donc la question du retour devient encore plus centrale.",
    stat: {
      number: "36 %",
      label: "des Français déclarent avoir assisté à un concert en 2024, contre 24 % en 2023.",
    },
    takeaways: [
      "Le retour doit être intégré au parcours événementiel dès l'annonce.",
      "Un bon point pickup est proche, éclairé, accessible et distinct de la foule.",
      "Le partenaire doit parler de mobilité pratique, pas seulement de sécurité abstraite.",
    ],
    sections: [
      {
        title: "Le retour, un sujet souvent sous-estimé",
        body: [
          "Quand on organise un événement, on pense naturellement à la programmation, à la billetterie, à l'accueil, à la sécurité sur place ou à la communication. Mais le retour est parfois traité comme un sujet secondaire.",
          "Pourtant, l'expérience d'une participante ne s'arrête pas quand elle quitte le lieu. Si elle ne sait pas comment rentrer, si elle doit attendre seule, si elle renonce à venir parce que le retour est trop compliqué, cela fait partie de son expérience globale.",
          "Un événement réussi, c'est aussi un événement auquel on peut venir, et dont on peut repartir, plus sereinement.",
        ],
      },
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
        title: "Drive Lady pour les festivals",
        body: [
          "Dans le cadre d'un festival, Drive Lady peut permettre aux participantes de proposer ou de rechercher des trajets entre femmes autour de l'événement.",
          "Une conductrice qui vient depuis Rouen, Le Havre, Caen ou une ville voisine peut proposer des places. Une passagère qui hésitait à venir faute de solution peut trouver une alternative.",
          "Le covoiturage devient alors un prolongement naturel de l'événement : plus économique, plus convivial et plus rassurant pour celles qui ne veulent pas rentrer seules.",
        ],
      },
      {
        title: "Drive Lady pour les campus",
        body: [
          "Sur un campus, les problématiques sont souvent récurrentes : retours de soirées étudiantes, trajets entre logement et école, événements associatifs, horaires décalés, stages, alternances ou transports limités selon les villes.",
          "Drive Lady peut aider à créer des habitudes de mobilité entre étudiantes. Une même conductrice peut publier un trajet régulier. Plusieurs passagères peuvent se regrouper. Les associations peuvent relayer l'outil avant un événement.",
          "L'objectif n'est pas de remplacer les transports existants, mais de proposer une solution complémentaire, surtout aux moments où les options sont limitées.",
        ],
      },
      {
        title: "Ce que cela change pour les participantes",
        body: [
          "Pour une participante, savoir qu'une solution de retour existe peut lever un vrai frein.",
          "Cela peut permettre de venir même si aucune amie ne rentre dans la même direction. De partager les frais. De ne pas attendre seule. De rencontrer d'autres femmes. De prolonger l'expérience de l'événement dans un cadre plus collectif.",
          "Et pour les conductrices, cela permet d'optimiser un trajet déjà prévu tout en aidant d'autres femmes à se déplacer.",
        ],
        compare: {
          goodTitle: "Partenariat visible",
          badTitle: "Partenariat faible",
          good: [
            "Drive Lady apparaît avant, pendant et après l'événement.",
            "Le point de rencontre est nommé et répété.",
            "Le message parle d'organisation, de confiance et de choix.",
          ],
          bad: [
            "Un logo ajouté en bas d'affiche sans explication.",
            "Un lien partagé uniquement après la fermeture.",
            "Un discours qui ne rassure pas, sans donner d'action concrète.",
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
    sourceKeys: ["sortiesCulturelles", "campus", "vssEsr", "aide"],
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
    intent: "Comment accompagner le retour des femmes dans une communication partenaire ?",
    title: "Partenariat sécurité femmes : comment mieux accompagner le retour des femmes ?",
    metaTitle: "Partenariat sécurité femmes : accompagner le retour des femmes",
    metaDescription: "Guide de communication pour bars, campus, festivals et marques : accompagner le retour des femmes avec un message utile, rassurant et non anxiogène.",
    summary: "Le sujet de la sécurité des femmes demande une communication précise. Un partenaire doit reconnaître le besoin sans dramatiser chaque sortie, expliquer l'usage sans promettre l'impossible et donner une action simple.",
    answer: "Pour intégrer Drive Lady à un événement, le plus important est de partir de l'usage : permettre aux participantes de rentrer plus facilement, de choisir un trajet entre femmes, de vérifier les informations avant le départ et d'éviter l'improvisation de fin de soirée. Le message doit rester concret, calme et orienté action.",
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
          "Une communication partenaire fonctionne lorsqu'elle trouve le bon équilibre. Elle ne doit ni minimiser les situations vécues par les femmes, ni présenter chaque sortie comme un danger. Drive Lady doit occuper une troisième voie : reconnaître le besoin, puis proposer un geste simple.",
          "La phrase centrale peut être très courte : « Pour votre retour, Drive Lady vous permet de réserver un trajet entre femmes avec des informations visibles avant le départ. » Elle dit l'usage, la cible et le bénéfice sans exagérer. Elle permet au partenaire de montrer qu'il accompagne l'expérience des participantes avant, pendant et après l'événement.",
        ],
        compare: {
          goodTitle: "À dire",
          badTitle: "À éviter",
          good: [
            "Préparez votre retour avant la fin de la soirée.",
            "Choisissez un trajet entre femmes avec des informations visibles.",
            "Retrouvez le point de rendez-vous indiqué par l'événement.",
          ],
          bad: [
            "Ne rentrez jamais seule.",
            "Avec Drive Lady, il ne peut rien vous arriver.",
            "Les transports sont dangereux, utilisez notre solution.",
          ],
        },
      },
      {
        title: "Les quatre composants d'un message partenaire",
        body: "Un message partenaire doit pouvoir tenir sur une affiche, une story, un email ou un écran sur place. Plus il est simple, plus il a de chances d'être utilisé au bon moment.",
        steps: [
          ["Contexte", "Pourquoi Drive Lady est proposé ici : retour tardif, événement, campus, lieu de sortie, horaires décalés."],
          ["Action", "Ce que la personne doit faire : scanner le QR code, rechercher un trajet, proposer une place, réserver ou rejoindre un point de rendez-vous."],
          ["Repère", "Où et quand le service est le plus utile : horaires, lieu, QR code visibles."],
          ["Limite", "Rappel sobre : Drive Lady est une solution de mobilité complémentaire. En cas d'urgence, il faut contacter les canaux officiels."],
        ],
      },
      {
        title: "Adapter le ton selon le partenaire",
        body: [
          "Un bar, une école, une association étudiante et un festival ne parlent pas exactement de la même façon. Mais le fond reste le même : Drive Lady n'est pas un simple outil de communication. C'est un service concret pour rendre les déplacements plus lisibles, plus organisés et plus rassurants.",
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
        title: "Pourquoi cette approche valorise aussi le partenaire",
        body: [
          "Proposer Drive Lady ne signifie pas que l'événement ou le lieu est dangereux. Au contraire, cela montre que le partenaire prend en compte l'expérience complète des participantes.",
          "Un événement ne commence pas seulement à l'entrée du lieu, et ne se termine pas au dernier morceau, au dernier verre ou au dernier discours. Il inclut aussi la manière dont les participantes viennent, repartent et s'organisent.",
          "En intégrant Drive Lady, un partenaire montre qu'il pense à la mobilité, au confort, à l'accessibilité et à la sécurité ressentie de son public féminin.",
        ],
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
  return `<footer class="footer"><div class="footer__inner"><div class="footer__top"><div class="footer__brand"><a class="footer__logo" href="/"><img src="/assets/drive-lady-logo.png" alt="Logo Drive Lady"/><span>Drive Lady</span></a><p>Le covoiturage entre femmes pensé pour les trajets du quotidien, les retours tardifs et les déplacements où la confiance doit rester visible.</p></div><nav class="footer__links"><div class="footer__column"><h2>Découvrir</h2><ul><li><a href="/comment-ca-marche/">Comment ça marche</a></li><li><a href="/trajets/">Trajets</a></li><li><a href="/securite/">Sécurité</a></li><li><a href="/faq/">FAQ</a></li></ul></div><div class="footer__column"><h2>Partenaires</h2><ul><li><a href="/evenements/">Événements</a></li><li><a href="/bars-lieux-de-soiree/">Bars et lieux de soirée</a></li><li><a href="/festivals-campus/">Festivals et campus</a></li><li><a href="/devenir-partenaire/">Devenir partenaire</a></li></ul></div><div class="footer__column"><h2>À propos</h2><ul><li><a href="/notre-mission/">Notre mission</a></li><li><a href="/notre-equipe/">Notre équipe</a></li><li><a href="/nous-rejoindre/">Nous rejoindre</a></li><li><a href="/presse/">Presse</a></li><li><a href="/histoire-drive-lady/">L'histoire de Drive Lady</a></li></ul></div><div class="footer__column"><h2>Contact</h2><ul><li><a href="/nous-ecrire/">Nous écrire</a></li><li><a href="/contact-partenaires/">Contact partenaires</a></li><li><a href="/signalement/">Faire un signalement</a></li><li><a href="/support/">Support</a></li></ul></div></nav></div><div class="footer__bottom"><p>Copyright &copy; <span data-current-year>2026</span> Drive Lady. Tous droits réservés.</p><p class="footer__credit">Site internet r&eacute;alis&eacute; par l'agence digitale <a href="https://scaly.co" target="_blank" rel="noreferrer noopener">Scaly</a></p><div class="footer__legal"><a href="/mentions-legales/">Mentions légales</a><a href="/conditions-generales-utilisation/">CGU</a><a href="/conditions-generales-de-vente/">CGV</a><a href="/politique-de-confidentialite/">Confidentialité</a></div></div></div></footer>`;
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
    <p class="eyebrow">Avant de partir</p>
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
  const searchText = [article.title, summaryText(article), article.intent, article.category, article.cluster, author.name].join(" ");
  return `<article class="blog-post-card" data-blog-card data-blog-category="${normalizeId(article.category)}" data-blog-search="${escapeHtml(searchText)}">
    <a href="/blog/${article.slug}/" aria-label="Lire ${escapeHtml(article.title)}">
      <img class="blog-post-card__image" src="${articleImage(article)}" alt="${escapeHtml(articleImageAlt(article))}" loading="lazy"/>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(summaryText(article))}</p>
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
          ${(Array.isArray(article.summary) ? article.summary : [article.summary]).map((paragraph) => `<p class="article-hero__lead">${escapeHtml(paragraph)}</p>`).join("\n          ")}
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
          ${article.answerExtra ? renderParagraphs(article.answerExtra) : ""}
          <div class="article-source-note">
            <strong>Pourquoi ce sujet compte</strong>
            <p>${article.sourceNote ? escapeHtml(article.sourceNote) : renderSourceFacts(article)}</p>
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
${renderAfterChecklist(article)}
        <section class="article-citation" id="sources">
          <p class="eyebrow">Sources officielles</p>
          <h2>Les références utilisées</h2>
          <ul>${article.sourceKeys.map((key) => `<li><a href="${escapeHtml(sources[key].url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(sources[key].label)}</a><span>${escapeHtml(sources[key].fact)}</span></li>`).join("")}</ul>
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
    ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
    ${renderParagraphs(section.body)}
    ${section.steps ? renderSteps(section.steps) : ""}
    ${section.list ? `<ul class="article-list">${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
    ${section.table ? renderTable(section.table) : ""}
    ${section.compare ? renderCompare(section.compare) : ""}
    ${section.outro ? renderParagraphs(section.outro) : ""}
  </section>`;
}

function renderParagraphs(body) {
  const paragraphs = Array.isArray(body) ? body : [body];
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderSteps(steps) {
  return `<ul class="article-list">${steps.map(([title, text], index) => {
    const isQuestion = title.trim().endsWith("?");
    const separator = isQuestion ? " " : " : ";
    const value = isQuestion ? text : `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    return `<li>${index + 1}. ${escapeHtml(title)}${separator}${escapeHtml(value)}</li>`;
  }).join("")}</ul>`;
}

function renderAfterChecklist(article) {
  return (article.afterChecklist || [])
    .map((section) => `
        <section class="article-section" id="${normalizeId(section.title)}">
          <h2>${escapeHtml(section.title)}</h2>
          ${renderParagraphs(section.body)}
        </section>
`)
    .join("");
}

function summaryText(article) {
  return Array.isArray(article.summary) ? article.summary.join(" ") : article.summary;
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
    "partenariat-marque-securite-femmes": "/assets/partner-so-rouen.jpg",
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
    summaryText(article),
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
