import path from "node:path";
import { readdirSync, statSync } from "node:fs";

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

function discoverRoutes(seedRoutes) {
  const routes = new Map(seedRoutes);
  const ignoredDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "app",
    "assets",
    "node_modules",
    "public",
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

export const ROUTES = discoverRoutes(STATIC_ROUTES);

// Forme canonique servie par Next : pas de slash final, sauf la racine.
export function routePath(routeKey) {
  return routeKey ? `/${routeKey}` : "/";
}
