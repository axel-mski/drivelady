import { notFound } from "next/navigation";
import SupportChatbot from "./SupportChatbot";
import styles from "./supportPortal.module.css";

const BASE_PATH = "/fr-fr";
const MAIN_SUPPORT_URL = process.env.NEXT_PUBLIC_MAIN_SUPPORT_URL || "http://localhost:5173/support";

const categories = [
  {
    slug: "premiers-pas",
    title: "Premiers pas sur Drive Lady",
    shortTitle: "Premiers pas",
    icon: "logo",
    sections: [
      {
        title: "Commencer avec Drive Lady",
        items: [
          "reservation-covoiturage-nouveau",
          "telecharger-application-drive-lady",
          "proposer-un-trajet",
          "trouver-recu",
          "contacter-support",
        ],
      },
    ],
  },
  {
    slug: "trajets",
    title: "Trajets",
    shortTitle: "Trajets",
    icon: "car",
    sections: [
      {
        title: "Réserver et rejoindre un trajet",
        items: [
          "reservation-covoiturage-nouveau",
          "contacter-conductrice",
          "modifier-annuler-trajet",
          "paiement-trajet",
        ],
      },
      {
        title: "Proposer un trajet",
        items: ["proposer-un-trajet", "gerer-demandes-reservation", "retard-depart-arrivee"],
      },
    ],
  },
  {
    slug: "application",
    title: "Application",
    shortTitle: "Application",
    icon: "phone",
    sections: [
      {
        title: "Installer et utiliser l'app",
        items: [
          "telecharger-application-drive-lady",
          "probleme-connexion",
          "notifications-application",
        ],
      },
    ],
  },
  {
    slug: "compte",
    title: "Profil & Compte",
    shortTitle: "Profil & Compte",
    icon: "profile",
    sections: [
      {
        title: "Gérer mon compte",
        items: ["modifier-profil", "verification-profil", "supprimer-compte"],
      },
      {
        title: "Données personnelles",
        items: ["donnees-personnelles", "localisation-confidentialite", "trouver-recu"],
      },
    ],
  },
  {
    slug: "securite",
    title: "Confiance, sécurité et accessibilité",
    shortTitle: "Sécurité",
    icon: "shield",
    sections: [
      {
        title: "Conditions générales et politiques",
        items: [
          "voyager-avec-animaux",
          "transport-colis",
          "politique-non-discrimination",
          "responsable-bagages",
        ],
      },
      {
        title: "Personnes à mobilité réduite",
        items: ["passagers-mobilite-reduite", "animaux-assistance"],
      },
      {
        title: "Signaler un problème",
        items: [
          "comment-signaler-message",
          "responsable-accident",
          "panne-ou-accident",
          "comportement-discriminatoire",
          "contenu-illicite",
          "compte-suspendu",
          "se-sentir-en-securite",
          "comportement-inapproprie",
        ],
      },
    ],
  },
  {
    slug: "partenaires",
    title: "Partenaires",
    shortTitle: "Partenaires",
    icon: "spark",
    sections: [
      {
        title: "Associations, lieux et événements",
        items: ["devenir-partenaire", "contact-partenaires", "kit-communication"],
      },
    ],
  },
];

const articles = {
  "reservation-covoiturage-nouveau": {
    title: "Réservation d'un covoiturage : que faire si vous êtes nouvelle sur Drive Lady",
    category: "premiers-pas",
    section: "Commencer avec Drive Lady",
    summary: "Les étapes pour rechercher un trajet, contacter une conductrice, réserver et suivre votre demande.",
    hero: "compact",
    headings: ["Rechercher un trajet", "Contacter une conductrice pour un trajet", "Réserver et payer en ligne"],
    content: [
      {
        heading: "Rechercher un trajet",
        paragraphs: [
          "Pour trouver un trajet, indiquez votre destination, votre point de départ et la date. Ensuite, choisissez le trajet qui vous convient.",
          "Si vous avez besoin de plus d'informations, vous pouvez envoyer un message à la conductrice avant de réserver, ou consulter son profil pour voir les informations de confiance disponibles.",
          "Vous ne trouvez pas de trajet ? Affinez vos résultats avec les filtres de recherche ou activez une alerte pour recevoir une notification lorsqu'un trajet est disponible.",
        ],
      },
      {
        heading: "Contacter une conductrice pour un trajet",
        paragraphs: [
          "Pour contacter une conductrice, ouvrez l'annonce du trajet et utilisez la messagerie Drive Lady. Posez toutes les questions utiles avant de confirmer votre place.",
          "Si vous préférez réserver immédiatement, choisissez Demander à réserver. La conductrice pourra accepter votre demande et vous recevrez une confirmation dans l'application.",
        ],
      },
      {
        heading: "Réserver et payer en ligne",
        paragraphs: [
          "Certaines conductrices acceptent la réservation instantanée. D'autres préfèrent examiner les demandes avant de confirmer.",
          "Lorsque vous envoyez la demande, Drive Lady confirme les détails du trajet et conserve le suivi dans Vos trajets. Si le trajet se déroule comme prévu, le paiement est transmis selon les conditions indiquées dans l'application.",
          "Si une personne vous envoie un lien de paiement en dehors de Drive Lady avant confirmation, ne payez pas et signalez le message depuis son profil.",
        ],
      },
    ],
  },
  "comment-signaler-message": {
    title: "Comment signaler un message sur Drive Lady ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "La marche à suivre pour signaler un message ou une conversation depuis votre boîte de réception.",
    hero: "search",
    headings: [],
    content: [
      {
        heading: null,
        paragraphs: ["Pour signaler le message d'une membre :"],
        steps: [
          "Allez dans votre Boîte de réception et sélectionnez la conversation avec la personne que vous voulez signaler.",
          "Depuis le bouton plus d'options en haut de la page, appuyez sur Signaler.",
          "Choisissez la raison pour laquelle vous signalez le message et suivez les instructions à l'écran.",
        ],
        paragraphsAfter: [
          "Pour en savoir plus sur le signalement d'un contenu illicite, consultez l'article dédié dans le centre d'aide.",
        ],
      },
    ],
  },
  "telecharger-application-drive-lady": {
    title: "Télécharger l'application Drive Lady",
    category: "premiers-pas",
    section: "Commencer avec Drive Lady",
    summary: "Installer Drive Lady, vérifier la version de l'app et résoudre les problèmes de téléchargement.",
    hero: "search",
    headings: ["Installer l'application", "Mettre l'application à jour"],
    content: [
      {
        heading: "Installer l'application",
        paragraphs: [
          "Drive Lady est pensée pour être utilisée depuis le mobile. Téléchargez l'application depuis le lien officiel communiqué par Drive Lady ou depuis votre invitation.",
          "Après l'installation, connectez-vous avec l'adresse e-mail utilisée lors de votre inscription.",
        ],
      },
      {
        heading: "Mettre l'application à jour",
        paragraphs: [
          "Si un écran ne se charge pas ou si une fonctionnalité manque, vérifiez que vous utilisez la dernière version disponible.",
        ],
      },
    ],
  },
  "proposer-un-trajet": {
    title: "Proposer un trajet",
    category: "premiers-pas",
    section: "Commencer avec Drive Lady",
    summary: "Créer une annonce de trajet avec l'heure, le point de départ, les places et les règles de réservation.",
    hero: "search",
    headings: ["Créer l'annonce", "Répondre aux demandes"],
    content: [
      {
        heading: "Créer l'annonce",
        paragraphs: [
          "Depuis l'application, choisissez Proposer un trajet, renseignez votre départ, votre destination, la date et le nombre de places disponibles.",
          "Ajoutez les informations utiles : lieu exact de rendez-vous, marge de retard possible et préférences de trajet.",
        ],
      },
      {
        heading: "Répondre aux demandes",
        paragraphs: [
          "Lorsqu'une passagère vous contacte, répondez depuis la messagerie Drive Lady afin de conserver une trace claire de l'échange.",
        ],
      },
    ],
  },
  "trouver-recu": {
    title: "Trouver votre reçu",
    category: "premiers-pas",
    section: "Commencer avec Drive Lady",
    summary: "Retrouver les détails d'un trajet et les justificatifs associés.",
    hero: "search",
    headings: ["Depuis vos trajets"],
    content: [
      {
        heading: "Depuis vos trajets",
        paragraphs: [
          "Ouvrez Vos trajets, sélectionnez le trajet concerné, puis consultez les détails de réservation.",
          "Si le reçu n'apparaît pas encore, vérifiez que le trajet est terminé et que le paiement a bien été confirmé.",
        ],
      },
    ],
  },
  "contacter-support": {
    title: "Comment obtenir de l'aide ou contacter Drive Lady ?",
    category: "premiers-pas",
    section: "Commencer avec Drive Lady",
    summary: "Les canaux à utiliser selon votre besoin : aide, partenariat ou signalement.",
    hero: "search",
    headings: ["Nous écrire", "Faire un signalement"],
    content: [
      {
        heading: "Nous écrire",
        paragraphs: [
          "Si vous n'avez pas trouvé votre réponse dans le centre d'aide, utilisez le formulaire de contact Drive Lady en décrivant le problème et l'adresse e-mail de votre compte.",
        ],
      },
      {
        heading: "Faire un signalement",
        paragraphs: [
          "Pour une situation liée à la sécurité, à un comportement inapproprié ou à un contenu problématique, utilisez le formulaire de signalement.",
        ],
      },
    ],
  },
  "responsable-accident": {
    title: "Qui est responsable en cas d'accident ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "Que faire après un accident et quels documents conserver.",
    hero: "search",
    headings: ["Pendant le trajet", "Après l'incident"],
    content: [
      {
        heading: "Pendant le trajet",
        paragraphs: [
          "La conductrice reste responsable de la conduite de son véhicule et doit respecter les obligations d'assurance applicables.",
          "En cas d'urgence, appelez les services compétents avant de contacter Drive Lady.",
        ],
      },
      {
        heading: "Après l'incident",
        paragraphs: [
          "Conservez les informations du trajet, les échanges et tout document utile. Signalez ensuite la situation à Drive Lady pour que l'équipe puisse suivre le dossier.",
        ],
      },
    ],
  },
  "panne-ou-accident": {
    title: "Que faire en cas de panne ou d'accident ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "Les bons réflexes si le trajet ne peut pas continuer normalement.",
    hero: "search",
    headings: ["Se mettre en sécurité", "Prévenir les personnes concernées"],
    content: [
      {
        heading: "Se mettre en sécurité",
        paragraphs: [
          "Placez-vous hors de danger, suivez les consignes de sécurité routière et contactez les secours si nécessaire.",
        ],
      },
      {
        heading: "Prévenir les personnes concernées",
        paragraphs: [
          "Informez les passagères et Drive Lady dès que possible afin que le trajet puisse être suivi ou clôturé correctement.",
        ],
      },
    ],
  },
  "comportement-discriminatoire": {
    title: "Comment signaler un comportement discriminatoire à Drive Lady ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "Signaler un propos ou comportement discriminatoire observé avant, pendant ou après un trajet.",
    hero: "search",
    headings: ["Utiliser le signalement", "Joindre les éléments utiles"],
    content: [
      {
        heading: "Utiliser le signalement",
        paragraphs: [
          "Ouvrez le profil ou la conversation concernée, puis choisissez Signaler. Décrivez les faits de manière précise et factuelle.",
        ],
      },
      {
        heading: "Joindre les éléments utiles",
        paragraphs: [
          "Ajoutez les captures ou détails qui permettent de comprendre la situation. L'équipe Drive Lady examinera le signalement.",
        ],
      },
    ],
  },
  "contenu-illicite": {
    title: "Comment signaler un contenu illicite",
    category: "securite",
    section: "Signaler un problème",
    summary: "Faire remonter un contenu interdit ou dangereux à l'équipe Drive Lady.",
    hero: "search",
    headings: ["Depuis la conversation", "Depuis le formulaire"],
    content: [
      {
        heading: "Depuis la conversation",
        paragraphs: [
          "Si le contenu apparaît dans la messagerie, utilisez l'action Signaler directement dans la conversation concernée.",
        ],
      },
      {
        heading: "Depuis le formulaire",
        paragraphs: [
          "Si vous ne pouvez plus accéder à l'échange, utilisez le formulaire de signalement et indiquez le maximum de détails.",
        ],
      },
    ],
  },
  "compte-suspendu": {
    title: "Drive Lady a suspendu mon compte. Qu'est-ce que cela signifie ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "Comprendre une suspension de compte et demander un réexamen.",
    hero: "search",
    headings: ["Pourquoi un compte peut être suspendu", "Demander un réexamen"],
    content: [
      {
        heading: "Pourquoi un compte peut être suspendu",
        paragraphs: [
          "Un compte peut être suspendu lorsqu'une règle de sécurité, de confiance ou d'utilisation semble avoir été enfreinte.",
        ],
      },
      {
        heading: "Demander un réexamen",
        paragraphs: [
          "Contactez le support avec l'adresse e-mail liée au compte et les informations qui permettent de comprendre votre situation.",
        ],
      },
    ],
  },
  "se-sentir-en-securite": {
    title: "Que faire si vous ne vous sentez pas en sécurité ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "Les actions prioritaires si une situation vous met mal à l'aise.",
    hero: "search",
    headings: ["Priorité à votre sécurité", "Prévenir Drive Lady"],
    content: [
      {
        heading: "Priorité à votre sécurité",
        paragraphs: [
          "Si vous êtes en danger immédiat, contactez les secours ou une personne de confiance avant toute autre démarche.",
        ],
      },
      {
        heading: "Prévenir Drive Lady",
        paragraphs: [
          "Dès que vous pouvez le faire, signalez la situation depuis l'application ou via le formulaire de contact.",
        ],
      },
    ],
  },
  "comportement-inapproprie": {
    title: "Comment signaler un comportement inapproprié ?",
    category: "securite",
    section: "Signaler un problème",
    summary: "Informer Drive Lady d'un comportement qui ne respecte pas les règles de la communauté.",
    hero: "search",
    headings: ["Depuis le profil", "Depuis le formulaire"],
    content: [
      {
        heading: "Depuis le profil",
        paragraphs: [
          "Ouvrez le profil de la personne concernée, choisissez Signaler et sélectionnez le motif le plus proche de la situation.",
        ],
      },
      {
        heading: "Depuis le formulaire",
        paragraphs: [
          "Si vous n'avez plus accès au profil, utilisez le formulaire de signalement et donnez les informations du trajet ou de la conversation.",
        ],
      },
    ],
  },
};

const placeholderArticles = {
  "contacter-conductrice": ["Contacter une conductrice pour un trajet", "trajets"],
  "modifier-annuler-trajet": ["Modifier ou annuler un trajet", "trajets"],
  "paiement-trajet": ["Réserver et payer en ligne", "trajets"],
  "gerer-demandes-reservation": ["Gérer les demandes de réservation", "trajets"],
  "retard-depart-arrivee": ["Que faire en cas de retard ?", "trajets"],
  "probleme-connexion": ["Je ne peux pas me connecter à mon compte", "application"],
  "notifications-application": ["Gérer les notifications de l'application", "application"],
  "modifier-profil": ["Mettre à jour ses informations de profil", "compte"],
  "verification-profil": ["Comprendre la vérification de profil", "compte"],
  "supprimer-compte": ["Supprimer mon compte Drive Lady", "compte"],
  "donnees-personnelles": ["Accéder à mes données personnelles", "compte"],
  "localisation-confidentialite": ["Localisation et confidentialité", "compte"],
  "voyager-avec-animaux": ["Voyager avec des animaux", "securite"],
  "transport-colis": ["Transport de colis", "securite"],
  "politique-non-discrimination": ["Politique de non-discrimination", "securite"],
  "responsable-bagages": ["Est-ce qu'une conductrice est responsable des bagages de ses passagères ?", "securite"],
  "passagers-mobilite-reduite": ["Passagères à mobilité réduite", "securite"],
  "animaux-assistance": ["Voyager avec des animaux d'assistance", "securite"],
  "devenir-partenaire": ["Devenir partenaire Drive Lady", "partenaires"],
  "contact-partenaires": ["Contacter l'équipe partenariats", "partenaires"],
  "kit-communication": ["Kit de communication Drive Lady", "partenaires"],
};

for (const [slug, [title, category]] of Object.entries(placeholderArticles)) {
  if (!articles[slug]) {
    articles[slug] = {
      title,
      category,
      section: category,
      summary: "Article d'aide Drive Lady.",
      hero: "search",
      headings: ["À propos"],
      content: [
        {
          heading: "À propos",
          paragraphs: [
            "Cette rubrique rassemble les informations essentielles pour utiliser Drive Lady dans de bonnes conditions.",
            "Si vous avez besoin d'une réponse spécifique, contactez l'équipe support avec les détails de votre compte ou du trajet concerné.",
          ],
        },
      ],
    };
  }
}

const articleList = Object.entries(articles).map(([slug, article]) => ({ slug, ...article }));

export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const route = await getSupportRoute(params);
  const article = getArticleFromRoute(route);
  const category = getCategoryFromRoute(route);

  if (article) {
    return {
      title: `${article.title} | Support Drive Lady`,
      description: article.summary,
    };
  }

  if (category) {
    return {
      title: `${category.title} | Support Drive Lady`,
      description: `Centre d'aide Drive Lady pour ${category.title.toLowerCase()}.`,
    };
  }

  return {
    title: "Support Drive Lady | Centre d'aide",
    description: "Trouvez les réponses aux questions fréquentes sur Drive Lady, les trajets, la sécurité et votre compte.",
  };
}

export default async function SupportPortalPage({ params, searchParams }) {
  const route = await getSupportRoute(params);
  const search = await searchParams;
  const query = normalizeQuery(search?.q);

  if (route === "" || route === "fr-fr") {
    return <HomePage query={query} />;
  }

  const category = getCategoryFromRoute(route);

  if (category) {
    return <CategoryPage category={category} query={query} />;
  }

  const article = getArticleFromRoute(route);

  if (article) {
    return <ArticlePage article={article} slug={route.replace("fr-fr/articles/", "")} query={query} />;
  }

  notFound();
}

async function getSupportRoute(paramsPromise) {
  const params = await paramsPromise;
  return (params?.supportSlug || []).map(decodeRouteSegment).join("/");
}

function decodeRouteSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function getCategoryFromRoute(route) {
  const slug = route.startsWith("fr-fr/categories/") ? route.replace("fr-fr/categories/", "") : "";
  return categories.find((category) => category.slug === slug);
}

function getArticleFromRoute(route) {
  const slug = route.startsWith("fr-fr/articles/") ? route.replace("fr-fr/articles/", "") : "";
  return slug ? articles[slug] : null;
}

function normalizeQuery(query) {
  return typeof query === "string" ? query.trim() : "";
}

function searchArticles(query) {
  const needle = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!needle) {
    return [];
  }

  return articleList
    .filter((article) => {
      const haystack = `${article.title} ${article.summary} ${article.headings.join(" ")}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return haystack.includes(needle);
    })
    .slice(0, 6);
}

function HomePage({ query }) {
  return (
    <SupportShell hero="large" query={query}>
      <main className={styles.homeMain}>
        <SearchResults query={query} />
        <section className={styles.homeOverview} aria-label="Accès rapides support">
          <div>
            <p className={styles.kicker}>Centre d'aide Drive Lady</p>
            <h2>Une réponse rapide, puis le bon canal si vous devez nous écrire.</h2>
            <p>
              Parcourez les rubriques, ouvrez un article ou utilisez le support classique si vous cherchez la page
              déjà présente sur le site principal.
            </p>
          </div>
          <div className={styles.quickActions}>
            <a className={styles.primaryAction} href={`${BASE_PATH}/articles/contacter-support`}>
              Contacter le support
            </a>
            <a className={styles.secondaryAction} href={MAIN_SUPPORT_URL}>
              Ouvrir http://localhost:5173/support
            </a>
          </div>
        </section>
        <section className={styles.categoryMatrix} aria-label="Catégories du centre d'aide">
          {categories.map((category) => (
            <a className={styles.categoryTile} href={`${BASE_PATH}/categories/${category.slug}`} key={category.slug}>
              <CategoryIcon name={category.icon} size="large" />
              <span>{category.title}</span>
            </a>
          ))}
        </section>
      </main>
    </SupportShell>
  );
}

function CategoryPage({ category, query }) {
  return (
    <SupportShell hero="large" query={query}>
      <main className={styles.contentFrame}>
        <Breadcrumb items={[{ label: category.title }]} />
        <div className={styles.categoryLayout}>
          <SupportNavigation currentCategory={category.slug} />
          <section className={styles.categoryContent} aria-labelledby="category-title">
            <div className={styles.categoryTitleRow}>
              <CategoryIcon name={category.icon} size="small" />
              <h1 id="category-title">{category.title}</h1>
            </div>
            <SearchResults query={query} />
            <div className={styles.accordionList}>
              {category.sections.map((section, index) => (
                <details className={styles.accordion} open key={section.title}>
                  <summary>
                    <span className={styles.folderIcon} aria-hidden="true" />
                    <span>{section.title}</span>
                    <ChevronIcon />
                  </summary>
                  <ul>
                    {section.items.map((slug) => (
                      <li key={slug}>
                        <a href={`${BASE_PATH}/articles/${slug}`}>
                          <DocumentIcon />
                          <span>{articles[slug]?.title || slug}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
    </SupportShell>
  );
}

function ArticlePage({ article, slug, query }) {
  const category = categories.find((item) => item.slug === article.category) || categories[0];
  const categoryArticles = category.sections.flatMap((section) => section.items);
  const heroMode = article.hero === "compact" ? "compact" : "large";

  return (
    <SupportShell hero={heroMode} query={query}>
      <main className={styles.contentFrame}>
        <Breadcrumb
          items={[
            { label: category.title, href: `${BASE_PATH}/categories/${category.slug}` },
            { label: article.section, href: `${BASE_PATH}/categories/${category.slug}` },
            { label: article.title },
          ]}
        />
        <SearchResults query={query} />
        <div className={styles.articleLayout}>
          <aside className={styles.articleMenu} aria-label={`Articles ${category.title}`}>
            {categoryArticles.map((articleSlug) => (
              <a
                className={articleSlug === slug ? styles.activeArticleLink : undefined}
                href={`${BASE_PATH}/articles/${articleSlug}`}
                key={articleSlug}
              >
                <DocumentIcon />
                <span>{articles[articleSlug]?.title || articleSlug}</span>
              </a>
            ))}
          </aside>
          <article className={styles.articleContent}>
            <h1>{article.title}</h1>
            {article.content.map((block, index) => (
              <section key={`${block.heading || "intro"}-${index}`} id={slugify(block.heading || article.title)}>
                {block.heading ? <h2>{block.heading}</h2> : null}
                {block.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {block.steps ? (
                  <ol>
                    {block.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : null}
                {block.paragraphsAfter?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            <HelpfulBox />
          </article>
          <aside className={styles.articleAside} aria-label="Sommaire et contact">
            {article.headings.length > 0 ? (
              <nav className={styles.summaryBox} aria-label="Sommaire">
                <div className={styles.summaryTitle}>
                  <DocumentIcon />
                  <span>Sommaire</span>
                </div>
                {article.headings.map((heading) => (
                  <a href={`#${slugify(heading)}`} key={heading}>
                    {heading}
                  </a>
                ))}
              </nav>
            ) : null}
            <ContactCard />
          </aside>
        </div>
      </main>
      <BackToTop />
    </SupportShell>
  );
}

function SupportShell({ children, hero, query }) {
  return (
    <div className={styles.supportApp}>
      <header id="top" className={hero === "compact" ? styles.topBandCompact : styles.topBand}>
        <div className={styles.topBar}>
          <a className={styles.brand} href={BASE_PATH} aria-label="Drive Lady support accueil">
            <img src="/assets/drive-lady-app-icon.png" alt="" width="56" height="56" />
            <span>Drive Lady</span>
          </a>
          <div className={styles.headerActions}>
            <button className={styles.languageButton} type="button">
              Français (FR)
              <ChevronIcon />
            </button>
            <a className={styles.supportShortcut} href={MAIN_SUPPORT_URL}>
              Support classique
            </a>
          </div>
        </div>
        {hero !== "compact" ? (
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Support Drive Lady</p>
            <h1>Comment peut-on vous aider ?</h1>
            <p className={styles.heroLead}>
              Retrouvez les réponses utiles sur les trajets, le compte, l'app et les signalements.
            </p>
            <SearchForm query={query} />
            <div className={styles.heroLinks} aria-label="Liens support rapides">
              <a href={`${BASE_PATH}/articles/reservation-covoiturage-nouveau`}>Première réservation</a>
              <a href={`${BASE_PATH}/categories/securite`}>Sécurité</a>
              <a href={MAIN_SUPPORT_URL}>Page support du site</a>
            </div>
          </div>
        ) : null}
      </header>
      {children}
      <SupportChatbot />
    </div>
  );
}

function SearchForm({ query }) {
  return (
    <form className={styles.searchForm} action={BASE_PATH} role="search">
      <SearchIcon />
      <input
        aria-label="Rechercher dans le centre d'aide"
        name="q"
        placeholder="Rechercher dans le centre d'aide"
        type="search"
        defaultValue={query}
      />
    </form>
  );
}

function SearchResults({ query }) {
  const results = searchArticles(query);

  if (!query) {
    return null;
  }

  return (
    <section className={styles.searchResults} aria-label="Résultats de recherche">
      <h2>Résultats pour "{query}"</h2>
      {results.length > 0 ? (
        <ul>
          {results.map((article) => (
            <li key={article.slug}>
              <a href={`${BASE_PATH}/articles/${article.slug}`}>
                <DocumentIcon />
                <span>{article.title}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun article ne correspond à cette recherche. Contactez-nous pour une réponse personnalisée.</p>
      )}
    </section>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
      <a href={BASE_PATH} aria-label="Accueil support Drive Lady">
        <HomeIcon />
      </a>
      {items.map((item) => (
        <span className={styles.breadcrumbItem} key={item.label}>
          <ChevronIcon />
          {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function SupportNavigation({ currentCategory }) {
  return (
    <aside className={styles.supportNav} aria-label="Catégories support">
      {categories.map((category) => (
        <a
          className={category.slug === currentCategory ? styles.activeCategoryLink : undefined}
          href={`${BASE_PATH}/categories/${category.slug}`}
          key={category.slug}
        >
          <CategoryIcon name={category.icon} size="nav" />
          <span>{category.title}</span>
        </a>
      ))}
    </aside>
  );
}

function ContactCard() {
  return (
    <section className={styles.contactCard} aria-label="Contact support">
      <button className={styles.contactCardHeader} type="button">
        <span>Vous n'avez pas trouvé votre réponse?</span>
        <ChevronIcon />
      </button>
      <div className={styles.contactCardBody}>
        <strong>Laissez-nous vous aider</strong>
        <a href={`${BASE_PATH}/articles/contacter-support`}>Contactez-nous</a>
        <a className={styles.supportCardLink} href={MAIN_SUPPORT_URL}>
          Voir la page support du site
        </a>
      </div>
    </section>
  );
}

function HelpfulBox() {
  return (
    <section className={styles.helpfulBox} aria-label="Retour sur l'article">
      <strong>Cet article vous a-t-il aidé ?</strong>
      <button type="button">
        <ThumbIcon />
        Oui
      </button>
      <button type="button">
        <ThumbIcon down />
        Non
      </button>
    </section>
  );
}

function BackToTop() {
  return (
    <a className={styles.backToTop} href="#top">
      <ArrowUpIcon />
      Remonter la page
    </a>
  );
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoryIcon({ name, size }) {
  const className = `${styles.categoryIcon} ${styles[`categoryIcon${capitalize(size)}`] || ""}`;

  if (name === "logo") {
    return (
      <span className={className} aria-hidden="true">
        <img src="/assets/drive-lady-logo.png" alt="" width="64" height="64" />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        {name === "car" ? (
          <>
            <path d="M9 28h30l-4-10H15L9 28Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="M12 28v7h5l2-4h10l2 4h5v-7" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="17" cy="34" r="3" fill="currentColor" />
            <circle cx="31" cy="34" r="3" fill="currentColor" />
          </>
        ) : null}
        {name === "phone" ? (
          <>
            <rect x="15" y="7" width="18" height="34" rx="5" stroke="currentColor" strokeWidth="3" />
            <path d="M21 34h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : null}
        {name === "profile" ? (
          <>
            <circle cx="24" cy="18" r="7" stroke="currentColor" strokeWidth="3" />
            <path d="M11 39c2.8-7 8-10.5 13-10.5S34.2 32 37 39" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : null}
        {name === "shield" ? (
          <>
            <path d="M24 6 38 12v9c0 9-5.8 16.2-14 20-8.2-3.8-14-11-14-20v-9L24 6Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="m17 23 5 5 10-11" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {name === "spark" ? (
          <>
            <path d="M24 6v36M6 24h36M12 12l24 24M36 12 12 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="24" r="7" fill="currentColor" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

function capitalize(value = "") {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function SearchIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className={styles.chevronSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m8 10 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m3 11 9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className={styles.documentSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v5h5M10 12h5M10 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbIcon({ down = false }) {
  return (
    <svg className={down ? styles.thumbDownSvg : styles.thumbSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 10v10H4V10h4Zm0 0 4-7h2.2c1.3 0 2.2 1.2 1.9 2.5L15.2 10H20c1.3 0 2.2 1.2 1.9 2.5l-1.4 5.7A2.4 2.4 0 0 1 18.1 20H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
