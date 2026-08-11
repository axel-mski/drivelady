import Script from "next/script";
import CookieBanner from "./CookieBanner";
import "../styles.css";
import "../pages.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Base absolue necessaire pour que l'image d'apercu soit servie avec une URL
// complete : les crawlers (WhatsApp, Facebook, X) rejettent les URL relatives.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://drivelady.vercel.app");

const PREVIEW_IMAGE = {
  url: "/assets/drive-lady-preview.jpg",
  width: 1563,
  height: 1563,
  alt: "Drive Lady",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "Drive Lady",
    locale: "fr_FR",
    images: [PREVIEW_IMAGE],
  },
  twitter: {
    card: "summary",
    images: [PREVIEW_IMAGE],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8e4b6d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/assets/drive-lady-app-icon.png" />
        <link rel="apple-touch-icon" href="/assets/drive-lady-app-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieBanner gaId={GA_ID} />
        <Script src="/site-script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
