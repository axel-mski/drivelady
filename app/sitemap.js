import { ROUTES, routePath } from "./site-routes";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://www.drivelady.fr");

// Genere depuis la meme liste de routes que les pages : toute page ajoutee
// au site apparait dans le sitemap sans intervention.
export default function sitemap() {
  return Array.from(ROUTES.keys())
    .sort()
    .map((routeKey) => ({
      url: `${SITE_URL}${routePath(routeKey)}`,
      changeFrequency: "monthly",
      priority: routeKey === "" ? 1 : 0.7,
    }));
}
