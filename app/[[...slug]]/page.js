import path from "node:path";
import { readFile } from "node:fs/promises";
import { notFound } from "next/navigation";
import { ROUTES, routePath } from "../site-routes";
import { OPEN_GRAPH_BASE } from "../site-meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from(ROUTES.keys()).map((route) => ({
    slug: route ? route.split("/") : [],
  }));
}

export async function generateMetadata({ params }) {
  const routeKey = await getRouteKey(params);
  const html = await readRouteHtml(routeKey);
  const canonical = routePath(routeKey);
  const title = extractTitle(html) || "Drive Lady";
  const description = extractDescription(html);

  return {
    title,
    description,
    // Canonique sans parametre de requete : /contact/?sujet=... est la meme
    // page que /contact/, sinon chaque sujet est indexe comme un doublon.
    alternates: { canonical },
    // OPEN_GRAPH_BASE doit etre repris ici : des qu'une page definit
    // openGraph, Next remplace celui du layout au lieu de le completer.
    openGraph: { ...OPEN_GRAPH_BASE, url: canonical, title, description },
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
  const relativePath = ROUTES.get(routeKey);

  if (!relativePath) {
    notFound();
  }

  const fullPath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath);

  try {
    return await readFile(fullPath, "utf8");
  } catch {
    notFound();
  }
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = match?.[1] || html;

  return body.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (script, attributes) => {
    if (/type=["']application\/ld\+json["']/i.test(attributes)) {
      return script;
    }

    return "";
  });
}

function extractTitle(html) {
  return decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "");
}

function extractDescription(html) {
  const nameFirstMatch = html.match(/<meta\s+name=["']description["'][^>]*\scontent=(["'])([\s\S]*?)\1[^>]*>/i);
  const contentFirstMatch = html.match(/<meta\s+content=(["'])([\s\S]*?)\1[^>]*\sname=["']description["'][^>]*>/i);
  const description = nameFirstMatch?.[2] ?? contentFirstMatch?.[2] ?? "";

  return decodeHtml(description.trim());
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
    return "/contact/";
  }

  if (cleanUrl.startsWith("contact.html#")) {
    return `/contact/${cleanUrl.slice("contact.html".length)}`;
  }

  const routeKey = cleanUrl.replace(/\/index\.html$/, "").replace(/\/$/, "");

  if (ROUTES.has(routeKey)) {
    return `/${routeKey}/`;
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
