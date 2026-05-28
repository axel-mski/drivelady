import path from "node:path";
import { readFile } from "node:fs/promises";
import { notFound } from "next/navigation";

const ROUTES = new Map([
  ["", "index.html"],
  ["contact", "contact.html"],
  ["a-propos", path.join("a-propos", "index.html")],
  ["blog", path.join("blog", "index.html")],
  ["notre-equipe", path.join("notre-equipe", "index.html")],
  ["mentions-legales", path.join("mentions-legales", "index.html")],
  [
    "conditions-generales-utilisation",
    path.join("conditions-generales-utilisation", "index.html"),
  ],
  ["politique-de-confidentialite", path.join("politique-de-confidentialite", "index.html")],
  ["conditions-generales-de-vente", path.join("conditions-generales-de-vente", "index.html")],
]);

const GENERATED_PAGES = new Map(
  [
    {
      route: "comment-ca-marche",
      group: "discover",
      eyebrow: "D&eacute;couvrir",
      title: "Comment ça marche",
      description:
        "Le parcours Drive Lady tient en trois gestes simples : créer son profil, proposer ou réserver un trajet, puis avancer avec les bons repères.",
      badge: "3 étapes",
      cards: [
        {
          title: "Crée ton profil",
          body:
            "Préférences, horaires, vérification d'identité et informations utiles sont préparés avant le premier trajet pour installer un cadre clair.",
        },
        {
          title: "Propose ou réserve",
          body:
            "Conductrice ou passagère, tu retrouves les informations importantes avant de valider : départ, arrivée, horaire et contexte du trajet.",
        },
        {
          title: "Avance en confiance",
          body:
            "Le partage de trajet, les profils vérifiés et les signalements permettent de garder un lien humain avant, pendant et après le covoiturage.",
        },
      ],
      cta: { label: "Accéder à l'app", href: "http://app.localhost:5173/" },
    },
    {
      route: "trajets",
      group: "discover",
      eyebrow: "Trajets",
      title: "Des trajets pour chaque moment",
      description:
        "Drive Lady accompagne les déplacements du quotidien, les retours tardifs et les départs ponctuels avec une communauté 100% féminine.",
      badge: "Quotidien, sorties, week-ends",
      cards: [
        {
          title: "Sorties et retours tardifs",
          body:
            "Après une soirée, un concert ou un événement, organise un retour avec une conductrice ou une passagère choisie selon tes attentes.",
        },
        {
          title: "Travail, école, quotidien",
          body:
            "Les trajets récurrents deviennent plus lisibles, moins anonymes et plus faciles à partager avec des profils vérifiés.",
        },
        {
          title: "Départs ponctuels",
          body:
            "Vacances, week-ends, campus ou rendez-vous exceptionnels : le même cadre de confiance reste disponible.",
        },
      ],
      cta: { label: "Rejoindre la communauté", href: "http://app.localhost:5173/" },
    },
    {
      route: "securite",
      group: "discover",
      eyebrow: "Confiance",
      title: "La sécurité avant, pendant et après le trajet",
      description:
        "Drive Lady rend visibles les informations qui comptent pour choisir un trajet, le suivre et signaler une situation si besoin.",
      badge: "Safety by default",
      cards: [
        {
          title: "Avant de valider",
          body:
            "Profil vérifié, récapitulatif du trajet, horaire et lieu de rendez-vous donnent les repères essentiels avant de réserver.",
        },
        {
          title: "Pendant le trajet",
          body:
            "Le partage live et les contacts de confiance gardent le lien ouvert quand le trajet est en cours.",
        },
        {
          title: "Après le trajet",
          body:
            "Les avis, les signalements et la modération humaine aident la communauté à rester exigeante et bienveillante.",
        },
      ],
      cta: { label: "Faire un signalement", href: "/signalement/" },
    },
    {
      route: "faq",
      group: "discover",
      eyebrow: "FAQ",
      title: "Questions fréquentes",
      description:
        "Les réponses essentielles sur Drive Lady, l'inscription, les trajets, la sécurité et les partenariats.",
      badge: "Réponses rapides",
      cards: [
        {
          title: "Qu'est-ce que Drive Lady ?",
          body:
            "Une application de covoiturage 100% entre femmes, pensée pour des trajets sereins, sécurisés et solidaires.",
        },
        {
          title: "Comment accéder à l'application ?",
          body:
            "Drive Lady fonctionne comme une web-app : depuis le navigateur, puis en l'ajoutant à l'écran d'accueil.",
        },
        {
          title: "Comment les profils sont-ils vérifiés ?",
          body:
            "L'inscription demande les informations nécessaires pour vérifier le profil et protéger les autres utilisatrices.",
        },
        {
          title: "Comment devenir partenaire ?",
          body:
            "Un lieu, campus, festival ou événement peut contacter l'équipe pour organiser des retours plus sereins.",
        },
      ],
      cta: { label: "Nous écrire", href: "/nous-ecrire/" },
    },
    {
      route: "evenements",
      group: "partners",
      eyebrow: "Partenaires",
      title: "Événements partenaires",
      description:
        "Drive Lady aide les événements à offrir une option de retour plus rassurante à leur public féminin.",
      badge: "Soirées, concerts, sorties",
      cards: [
        {
          title: "Anticiper les retours",
          body:
            "Avant un événement, les participantes peuvent proposer ou rechercher un trajet dans un cadre plus lisible.",
        },
        {
          title: "Limiter les retours isolés",
          body:
            "La communauté facilite les trajets partagés quand les horaires, les zones ou les transports deviennent moins confortables.",
        },
        {
          title: "Activer un partenariat",
          body:
            "L'équipe Drive Lady accompagne les lieux et organisateurs qui veulent orienter leur public vers une solution dédiée.",
        },
      ],
      cta: { label: "Devenir partenaire", href: "/devenir-partenaire/" },
    },
    {
      route: "bars-lieux-de-soiree",
      group: "partners",
      eyebrow: "Partenaires",
      title: "Bars et lieux de soirée",
      description:
        "Bars, clubs et lieux de sortie peuvent proposer Drive Lady comme réflexe de retour pour leur clientèle féminine.",
      badge: "Sorties plus sereines",
      cards: [
        {
          title: "Un retour identifiable",
          body:
            "Les clientes savent où retrouver l'option Drive Lady et comment préparer leur retour avant la fin de la soirée.",
        },
        {
          title: "Un cadre cohérent",
          body:
            "Le partenariat s'inscrit dans une démarche de prévention, de bienveillance et de mobilité plus sûre.",
        },
        {
          title: "Une prise de contact simple",
          body:
            "L'équipe peut étudier le lieu, le public, les horaires et le besoin pour proposer une mise en place adaptée.",
        },
      ],
      cta: { label: "Contact partenaires", href: "/contact-partenaires/" },
    },
    {
      route: "festivals-campus",
      group: "partners",
      eyebrow: "Partenaires",
      title: "Festivals et campus",
      description:
        "Drive Lady accompagne les lieux avec de forts flux de départ : festivals, campus, écoles et grands rassemblements.",
      badge: "Flux et retours",
      cards: [
        {
          title: "Pour les temps forts",
          body:
            "Avant et après un festival ou une soirée étudiante, les participantes peuvent s'organiser entre elles.",
        },
        {
          title: "Pour les habitudes récurrentes",
          body:
            "Sur un campus, les trajets du quotidien deviennent plus faciles à repérer et à partager dans une communauté dédiée.",
        },
        {
          title: "Pour les organisateurs",
          body:
            "Drive Lady devient une option lisible à communiquer dans les informations pratiques et les supports de prévention.",
        },
      ],
      cta: { label: "Proposer un partenariat", href: "/devenir-partenaire/" },
    },
    {
      route: "devenir-partenaire",
      group: "partners",
      eyebrow: "Partenariat",
      title: "Devenir partenaire Drive Lady",
      description:
        "Lieux de sortie, festivals, campus, entreprises et collectivités peuvent contacter Drive Lady pour faciliter les retours.",
      badge: "Prise de contact",
      cards: [
        {
          title: "Qui peut devenir partenaire ?",
          body:
            "Un événement, un bar, une école, un campus, une entreprise ou une collectivité qui veut proposer un retour plus rassurant.",
        },
        {
          title: "Ce que l'on prépare ensemble",
          body:
            "Le public concerné, les horaires, les zones de départ et les messages utiles pour que l'option soit claire.",
        },
        {
          title: "Comment démarrer",
          body:
            "Envoyez quelques informations sur votre structure et l'équipe revient vers vous avec les prochaines étapes.",
        },
      ],
      cta: {
        label: "Écrire à l'équipe",
        href: "mailto:driveladypro@gmail.com?subject=Partenariat%20Drive%20Lady",
      },
    },
    {
      route: "notre-mission",
      group: "about",
      eyebrow: "À propos",
      title: "Notre mission",
      description:
        "Drive Lady veut rendre le covoiturage entre femmes plus accessible, plus lisible et plus rassurant.",
      badge: "Mobilité et confiance",
      cards: [
        {
          title: "Redonner du choix",
          body:
            "Les trajets ne devraient pas dépendre uniquement des horaires de transport, de la chance ou d'un retour improvisé.",
        },
        {
          title: "Créer une communauté utile",
          body:
            "Drive Lady rassemble conductrices et passagères autour de réflexes partagés : respect, vérification et entraide.",
        },
        {
          title: "Rendre la confiance visible",
          body:
            "Profil, trajet, contexte et canal de signalement sont pensés pour être compris avant de monter en voiture.",
        },
      ],
      cta: { label: "Rejoindre la communauté", href: "http://app.localhost:5173/" },
    },
    {
      route: "presse",
      group: "about",
      eyebrow: "Presse",
      title: "Drive Lady dans les médias",
      description:
        "Retrouvez les principaux médias qui ont parlé de Drive Lady et de sa mission autour du covoiturage entre femmes.",
      badge: "On parle de nous",
      cards: [
        {
          title: "RTL, BFM, France Bleu",
          body:
            "Drive Lady a été présentée dans plusieurs formats audio et vidéo autour de la mobilité féminine.",
        },
        {
          title: "Libération et presse régionale",
          body:
            "Les articles reviennent sur l'origine du projet, son positionnement et les usages visés.",
        },
        {
          title: "Demandes presse",
          body:
            "Pour une interview, un portrait ou une demande d'information, contactez directement l'équipe Drive Lady.",
        },
      ],
      cta: {
        label: "Contact presse",
        href: "mailto:driveladypro@gmail.com?subject=Presse%20Drive%20Lady",
      },
    },
    {
      route: "histoire-drive-lady",
      group: "about",
      eyebrow: "Histoire",
      title: "L'histoire de Drive Lady",
      description:
        "Drive Lady est née d'un besoin simple : pouvoir rentrer, voyager et se déplacer avec plus de sérénité.",
      badge: "Par et pour les femmes",
      cards: [
        {
          title: "Un constat de terrain",
          body:
            "Les retours tardifs, les sorties et les trajets anonymes demandent souvent plus d'attention pour les femmes.",
        },
        {
          title: "Une réponse dédiée",
          body:
            "Drive Lady construit une expérience de covoiturage où la communauté, les profils vérifiés et le respect sont centraux.",
        },
        {
          title: "Une ambition claire",
          body:
            "Installer un réflexe de mobilité partagée entre femmes pour les trajets du quotidien comme pour les événements.",
        },
      ],
      cta: { label: "Lire notre mission", href: "/notre-mission/" },
    },
    {
      route: "nous-ecrire",
      group: "contact",
      eyebrow: "Contact",
      title: "Nous écrire",
      description:
        "Une question sur Drive Lady, l'application, la communauté ou un trajet ? Écrivez à l'équipe.",
      badge: "Réponse par email",
      cards: [
        {
          title: "Question générale",
          body:
            "Pour comprendre le fonctionnement, l'inscription, les trajets ou la communauté, envoyez votre message à l'équipe.",
        },
        {
          title: "Application et compte",
          body:
            "Si vous avez besoin d'aide pour rejoindre, proposer un trajet ou utiliser l'application, indiquez le contexte dans votre email.",
        },
        {
          title: "Confidentialité",
          body:
            "Pour une demande liée aux données personnelles, précisez le compte concerné et le type de demande.",
        },
      ],
      cta: {
        label: "Envoyer un email",
        href: "mailto:driveladypro@gmail.com?subject=Contact%20Drive%20Lady",
      },
    },
    {
      route: "contact-partenaires",
      group: "contact",
      eyebrow: "Contact",
      title: "Contact partenaires",
      description:
        "Un lieu, un événement, un campus ou une structure souhaite échanger avec Drive Lady ? Cette page oriente la demande.",
      badge: "Partenariats",
      cards: [
        {
          title: "Présenter votre structure",
          body:
            "Indiquez le nom du lieu ou de l'événement, la ville, les dates ou horaires concernés et le public visé.",
        },
        {
          title: "Expliquer le besoin",
          body:
            "Retours de soirée, festival, campus, horaires décalés : plus le contexte est clair, plus la réponse sera adaptée.",
        },
        {
          title: "Préparer la suite",
          body:
            "L'équipe revient vers vous pour qualifier le partenariat et les supports utiles à mettre en place.",
        },
      ],
      cta: {
        label: "Proposer un partenariat",
        href: "mailto:driveladypro@gmail.com?subject=Partenariat%20Drive%20Lady",
      },
    },
    {
      route: "signalement",
      group: "contact",
      eyebrow: "Signalement",
      title: "Faire un signalement",
      description:
        "Une situation inappropriée, un trajet problématique ou une question de sécurité doit pouvoir être transmise rapidement.",
      badge: "Confidentiel",
      cards: [
        {
          title: "Quand signaler ?",
          body:
            "Comportement inapproprié, sécurité, trajet problématique, doute sur un profil ou question de confidentialité.",
        },
        {
          title: "Quoi indiquer ?",
          body:
            "Précisez la date, le trajet, les profils concernés et les faits observés pour faciliter le traitement.",
        },
        {
          title: "Traitement humain",
          body:
            "Chaque message est lu avec attention afin de protéger la communauté et de prendre les mesures nécessaires.",
        },
      ],
      cta: {
        label: "Écrire au support",
        href: "mailto:driveladypro@gmail.com?subject=Signalement%20Drive%20Lady",
      },
    },
    {
      route: "support",
      group: "contact",
      eyebrow: "Support",
      title: "Support Drive Lady",
      description:
        "Le support Drive Lady aide sur l'application, les comptes, les trajets, les signalements et les demandes urgentes.",
      badge: "Aide",
      cards: [
        {
          title: "Aide application",
          body:
            "Besoin d'aide pour accéder à la web-app, créer un compte, proposer un trajet ou réserver ? Décrivez le blocage.",
        },
        {
          title: "Aide trajet",
          body:
            "Pour une question liée à un trajet précis, indiquez l'horaire, le lieu et les informations disponibles.",
        },
        {
          title: "Aide sécurité",
          body:
            "Pour une situation sensible, utilisez l'objet signalement afin que le message soit qualifié rapidement.",
        },
      ],
      cta: {
        label: "Contacter le support",
        href: "mailto:driveladypro@gmail.com?subject=Support%20Drive%20Lady",
      },
    },
  ].map((page) => [page.route, page])
);

const SITE_ROUTES = [
  "a-propos",
  "blog",
  "notre-equipe",
  "mentions-legales",
  "conditions-generales-utilisation",
  "politique-de-confidentialite",
  "conditions-generales-de-vente",
  ...GENERATED_PAGES.keys(),
];

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from(new Set([...ROUTES.keys(), ...GENERATED_PAGES.keys()])).map((route) => ({
    slug: route ? route.split("/") : [],
  }));
}

export async function generateMetadata({ params }) {
  const html = await readRouteHtml(await getRouteKey(params));

  return {
    title: extractTitle(html) || "Drive Lady",
    description: extractDescription(html),
  };
}

export default async function StaticSitePage({ params }) {
  const html = await readRouteHtml(await getRouteKey(params));
  const body = normalizeMarkup(extractBody(html));

  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

async function getRouteKey(paramsPromise) {
  const params = await paramsPromise;
  const slug = params?.slug || [];
  return slug.map(decodeRouteSegment).join("/");
}

function decodeRouteSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

async function readRouteHtml(routeKey) {
  const generatedPage = GENERATED_PAGES.get(routeKey);

  if (generatedPage) {
    return renderGeneratedPage(generatedPage, routeKey);
  }

  const relativePath = ROUTES.get(routeKey);

  if (!relativePath) {
    notFound();
  }

  const fullPath = path.join(process.cwd(), relativePath);

  try {
    return await readFile(fullPath, "utf8");
  } catch {
    notFound();
  }
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = match?.[1] || html;

  return body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function extractTitle(html) {
  return decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "");
}

function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i);
  return decodeHtml(match?.[1]?.trim() || "");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeMarkup(markup) {
  return markup.replace(/\b(href|src)=("([^"]*)"|'([^']*)')/g, (match, attribute, quoted, doubleUrl, singleUrl) => {
    const quote = quoted[0];
    const url = doubleUrl ?? singleUrl ?? "";
    const normalizedUrl = normalizeUrl(url);

    return `${attribute}=${quote}${normalizedUrl}${quote}`;
  });
}

function normalizeUrl(url) {
  if (url.startsWith("#")) {
    return url;
  }

  if (/^(https?:|mailto:|tel:|\/)/i.test(url)) {
    return url;
  }

  const cleanUrl = url.replace(/^(\.\/|\.\.\/)+/, "");
  const legacyRoute = legacyAnchorRoute(cleanUrl);

  if (legacyRoute) {
    return legacyRoute;
  }

  if (cleanUrl.startsWith("assets/")) {
    return `/${cleanUrl}`;
  }

  if (cleanUrl === "index.html") {
    return "/";
  }

  if (cleanUrl.startsWith("index.html#")) {
    return `/${cleanUrl.slice("index.html".length)}`;
  }

  if (cleanUrl === "contact.html") {
    return "/contact";
  }

  if (cleanUrl.startsWith("contact.html#")) {
    return `/contact${cleanUrl.slice("contact.html".length)}`;
  }

  for (const route of SITE_ROUTES) {
    if (cleanUrl === route || cleanUrl === `${route}/`) {
      return `/${route}/`;
    }
  }

  return url;
}

function legacyAnchorRoute(url) {
  const aliases = new Map([
    ["index.html#fonctionnement", "/comment-ca-marche/"],
    ["index.html#trajets", "/trajets/"],
    ["index.html#confiance", "/securite/"],
    ["index.html#faq", "/faq/"],
    ["index.html#partenaires", "/evenements/"],
    ["a-propos/#mission", "/notre-mission/"],
    ["a-propos/#presse", "/presse/"],
    ["a-propos/#partenaires", "/bars-lieux-de-soiree/"],
    ["contact.html#partenaires", "/contact-partenaires/"],
    ["contact.html#signalement", "/signalement/"],
  ]);

  return aliases.get(url);
}

function renderGeneratedPage(page, routeKey) {
  const titleText = htmlToPlainText(page.title);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Drive Lady | ${titleText}</title>
    <meta name="description" content="${escapeAttribute(page.description)}" />
    <meta name="theme-color" content="#f8b6de" />
  </head>
  <body>
    <a class="skip-link" href="#main">Aller au contenu</a>
    <div class="page-stage">
      <div class="site-frame">
        ${renderHeader(page.group, routeKey)}
        <main id="main" class="legal-main">
          <section class="legal-hero" id="top" aria-labelledby="${routeKey}-title">
            <p class="eyebrow">${page.eyebrow}</p>
            <h1 id="${routeKey}-title">${page.title}</h1>
            <p>${page.description}</p>
            <span>${page.badge}</span>
          </section>
          <section class="legal-layout" aria-label="${escapeAttribute(titleText)}">
            <aside class="legal-sidebar" aria-label="Pages liées">
              ${renderGroupLinks(page.group, routeKey)}
            </aside>
            <div class="legal-content">
              ${page.cards.map(renderGeneratedCard).join("")}
              <article class="legal-card">
                <h2>Prochaine étape</h2>
                <p>Retrouvez l'équipe Drive Lady ou accédez directement à la communauté selon votre besoin.</p>
                <a class="button button--primary" href="${page.cta.href}">${page.cta.label}</a>
              </article>
            </div>
          </section>
        </main>
        ${renderFooter()}
      </div>
    </div>
  </body>
</html>`;
}

function renderHeader(activeGroup, routeKey) {
  return `<header class="site-header" data-header>
          <nav class="nav-shell" aria-label="Navigation principale">
            <a class="brand" href="/" aria-label="Drive Lady accueil">
              <img src="/assets/drive-lady-logo.png" alt="Logo Drive Lady" />
              <span>Drive Lady</span>
            </a>
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-button>
              <span></span>
              <span></span>
              <span></span>
              <span class="sr-only">Ouvrir le menu</span>
            </button>
            <div class="nav-links" id="site-menu" data-menu>
              ${renderNavDropdown("discover", "D&eacute;couvrir", activeGroup, routeKey)}
              <div class="nav-dropdown${activeGroup === "partners" ? " is-current" : ""}" data-nav-dropdown>
                <button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="nav-partners-menu" data-nav-dropdown-trigger>
                  Partenaires
                  ${renderChevron()}
                </button>
                <div class="nav-dropdown__menu" id="nav-partners-menu">
                  ${renderDropdownLink("evenements", "&Eacute;v&eacute;nements", routeKey)}
                  ${renderDropdownLink("bars-lieux-de-soiree", "Bars et lieux de soir&eacute;e", routeKey)}
                  ${renderDropdownLink("festivals-campus", "Festivals et campus", routeKey)}
                  ${renderDropdownLink("devenir-partenaire", "Devenir partenaire", routeKey)}
                </div>
              </div>
              <a href="/blog/">Blog</a>
              ${renderNavDropdown("about", "&Agrave; propos", activeGroup, routeKey)}
              ${renderNavDropdown("contact", "Contact", activeGroup, routeKey)}
            </div>
            <a class="nav-cta" href="http://app.localhost:5173/">Rejoindre la communaut&eacute;</a>
          </nav>
        </header>`;
}

function renderNavDropdown(group, label, activeGroup, routeKey) {
  const links = {
    discover: [
      ["comment-ca-marche", "Comment &ccedil;a marche"],
      ["trajets", "Trajets"],
      ["securite", "S&eacute;curit&eacute;"],
      ["faq", "FAQ"],
    ],
    about: [
      ["notre-mission", "Notre mission"],
      ["notre-equipe", "Notre &eacute;quipe"],
      ["presse", "Presse"],
      ["histoire-drive-lady", "L'histoire de Drive Lady"],
    ],
    contact: [
      ["nous-ecrire", "Nous &eacute;crire"],
      ["contact-partenaires", "Contact partenaires"],
      ["signalement", "Faire un signalement"],
      ["support", "Support"],
    ],
  }[group];

  return `<div class="nav-dropdown${activeGroup === group ? " is-current" : ""}" data-nav-dropdown>
                <button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="nav-${group}-menu" data-nav-dropdown-trigger>
                  ${label}
                  ${renderChevron()}
                </button>
                <div class="nav-dropdown__menu" id="nav-${group}-menu">
                  ${links.map(([route, linkLabel]) => renderDropdownLink(route, linkLabel, routeKey)).join("")}
                </div>
              </div>`;
}

function renderChevron() {
  return `<svg class="nav-dropdown__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
}

function renderDropdownLink(route, label, routeKey) {
  return `<a href="/${route}/"${route === routeKey ? ' aria-current="page"' : ""}>${label}</a>`;
}

function renderGroupLinks(group, routeKey) {
  const groupedRoutes = {
    discover: ["comment-ca-marche", "trajets", "securite", "faq"],
    partners: ["evenements", "bars-lieux-de-soiree", "festivals-campus", "devenir-partenaire"],
    about: ["notre-mission", "notre-equipe", "presse", "histoire-drive-lady"],
    contact: ["nous-ecrire", "contact-partenaires", "signalement", "support"],
  }[group];

  return groupedRoutes
    .map((route) => {
      const page = GENERATED_PAGES.get(route);
      const label = page?.title || (route === "notre-equipe" ? "Notre &eacute;quipe" : route);

      return `<a href="/${route}/"${route === routeKey ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
}

function renderGeneratedCard(card) {
  return `<article class="legal-card">
                <h2>${card.title}</h2>
                <p>${card.body}</p>
              </article>`;
}

function renderFooter() {
  return `<footer class="footer">
          <div class="footer__inner">
            <div class="footer__top">
              <div class="footer__brand">
                <a class="footer__logo" href="/" aria-label="Drive Lady accueil">
                  <img src="/assets/drive-lady-logo.png" alt="Logo Drive Lady" />
                  <span>Drive Lady</span>
                </a>
                <p>
                  Le covoiturage entre femmes pensé pour les trajets du quotidien, les retours tardifs
                  et les déplacements où la confiance doit rester visible.
                </p>
              </div>
              <nav class="footer__links" aria-label="Navigation de pied de page">
                <div class="footer__column">
                  <h2>D&eacute;couvrir</h2>
                  <ul>
                    <li><a href="/comment-ca-marche/">Comment &ccedil;a marche</a></li>
                    <li><a href="/trajets/">Trajets</a></li>
                    <li><a href="/securite/">S&eacute;curit&eacute;</a></li>
                    <li><a href="/faq/">FAQ</a></li>
                  </ul>
                </div>
                <div class="footer__column">
                  <h2>Partenaires</h2>
                  <ul>
                    <li><a href="/evenements/">&Eacute;v&eacute;nements</a></li>
                    <li><a href="/bars-lieux-de-soiree/">Bars et lieux de soir&eacute;e</a></li>
                    <li><a href="/festivals-campus/">Festivals et campus</a></li>
                    <li><a href="/devenir-partenaire/">Devenir partenaire</a></li>
                  </ul>
                </div>
                <div class="footer__column">
                  <h2>&Agrave; propos</h2>
                  <ul>
                    <li><a href="/notre-mission/">Notre mission</a></li>
                    <li><a href="/notre-equipe/">Notre &eacute;quipe</a></li>
                    <li><a href="/presse/">Presse</a></li>
                    <li><a href="/histoire-drive-lady/">L'histoire de Drive Lady</a></li>
                  </ul>
                </div>
                <div class="footer__column">
                  <h2>Contact</h2>
                  <ul>
                    <li><a href="/nous-ecrire/">Nous &eacute;crire</a></li>
                    <li><a href="/contact-partenaires/">Contact partenaires</a></li>
                    <li><a href="/signalement/">Faire un signalement</a></li>
                    <li><a href="/support/">Support</a></li>
                  </ul>
                </div>
              </nav>
            </div>
            <div class="footer__bottom">
              <p>Copyright &copy; <span data-current-year>2026</span> Drive Lady. Tous droits r&eacute;serv&eacute;s.</p>
              <div>
                <a href="/mentions-legales/">Mentions l&eacute;gales</a>
                <a href="/conditions-generales-utilisation/">CGU</a>
                <a href="/conditions-generales-de-vente/">CGV</a>
                <a href="/politique-de-confidentialite/">Confidentialit&eacute;</a>
              </div>
            </div>
          </div>
        </footer>`;
}

function escapeAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlToPlainText(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&ccedil;/g, "c")
    .replace(/&eacute;/g, "e")
    .replace(/&egrave;/g, "e")
    .replace(/&agrave;/g, "a")
    .replace(/&Eacute;/g, "E")
    .replace(/&Agrave;/g, "A")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
