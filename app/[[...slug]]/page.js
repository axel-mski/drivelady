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

const SITE_ROUTES = [
  "a-propos",
  "blog",
  "notre-equipe",
  "mentions-legales",
  "conditions-generales-utilisation",
  "politique-de-confidentialite",
  "conditions-generales-de-vente",
];

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

async function readRouteHtml(routeKey) {
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
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) {
    return url;
  }

  const cleanUrl = url.replace(/^(\.\/|\.\.\/)+/, "");

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
    if (cleanUrl === `${route}/`) {
      return `/${route}/`;
    }
  }

  return url;
}
