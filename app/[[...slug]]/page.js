import path from "node:path";
import { readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { notFound } from "next/navigation";

const STATIC_ROUTES = new Map([
  ["", "index.html"],
  ["contact", "contact.html"],
  ["a-propos", path.join("a-propos", "index.html")],
  ["blog", path.join("blog", "index.html")],
  ["comment-ca-marche", path.join("comment-ca-marche", "index.html")],
  ["trajets", path.join("trajets", "index.html")],
  ["securite", path.join("securite", "index.html")],
  ["faq", path.join("faq", "index.html")],
  ["evenements", path.join("evenements", "index.html")],
  ["bars-lieux-de-soiree", path.join("bars-lieux-de-soiree", "index.html")],
  ["festivals-campus", path.join("festivals-campus", "index.html")],
  ["devenir-partenaire", path.join("devenir-partenaire", "index.html")],
  ["notre-mission", path.join("notre-mission", "index.html")],
  ["notre-equipe", path.join("notre-equipe", "index.html")],
  ["nous-rejoindre", path.join("nous-rejoindre", "index.html")],
  ["presse", path.join("presse", "index.html")],
  ["histoire-drive-lady", path.join("histoire-drive-lady", "index.html")],
  ["nous-ecrire", path.join("nous-ecrire", "index.html")],
  ["contact-partenaires", path.join("contact-partenaires", "index.html")],
  ["signalement", path.join("signalement", "index.html")],
  ["support", path.join("support", "index.html")],
  ["mentions-legales", path.join("mentions-legales", "index.html")],
  ["conditions-generales-utilisation", path.join("conditions-generales-utilisation", "index.html")],
  ["politique-de-confidentialite", path.join("politique-de-confidentialite", "index.html")],
  ["conditions-generales-de-vente", path.join("conditions-generales-de-vente", "index.html")],
]);

const ROUTES = discoverRoutes(STATIC_ROUTES);

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from(ROUTES.keys()).map((route) => ({
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

function discoverRoutes(seedRoutes) {
  const routes = new Map(seedRoutes);
  const ignoredDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "app",
    "assets",
    "node_modules",
    "scripts",
  ]);

  function walk(currentDirectory, routePrefix = "") {
    let entries = [];

    try {
      entries = readdirSync(currentDirectory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || ignoredDirectories.has(entry.name)) {
        continue;
      }

      const routeKey = routePrefix ? `${routePrefix}/${entry.name}` : entry.name;
      const routeDirectory = path.join(currentDirectory, entry.name);
      const routeFile = path.join(routeDirectory, "index.html");

      try {
        if (statSync(routeFile).isFile()) {
          routes.set(routeKey, path.relative(process.cwd(), routeFile));
        }
      } catch {
        // If the directory cannot be read during build, keep the explicit route map.
      }

      walk(routeDirectory, routeKey);
    }
  }

  walk(/*turbopackIgnore: true*/ process.cwd());

  return routes;
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
    return "/contact";
  }

  if (cleanUrl.startsWith("contact.html#")) {
    return `/contact${cleanUrl.slice("contact.html".length)}`;
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
