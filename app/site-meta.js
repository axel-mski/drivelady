// Base absolue necessaire pour que l'image d'apercu et les canoniques soient
// servies avec une URL complete : les crawlers (WhatsApp, Facebook, X)
// rejettent les URL relatives.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://www.drivelady.fr");

export const PREVIEW_IMAGE = {
  url: "/assets/drive-lady-preview.jpg",
  width: 1563,
  height: 1563,
  alt: "Drive Lady",
};

// Partage par le layout et les pages. Next remplace entierement l'objet
// openGraph du parent des qu'une page en definit un : les pages doivent donc
// reprendre cette base, sinon l'image d'apercu disparait.
export const OPEN_GRAPH_BASE = {
  type: "website",
  siteName: "Drive Lady",
  locale: "fr_FR",
  images: [PREVIEW_IMAGE],
};
