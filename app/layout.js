import Script from "next/script";
import CookieBanner from "./CookieBanner";
import { OPEN_GRAPH_BASE, PREVIEW_IMAGE, SITE_URL } from "./site-meta";
import "../styles.css";
import "../pages.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;



export const metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: OPEN_GRAPH_BASE,
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
        {RECAPTCHA_SITE_KEY ? <meta name="recaptcha-site-key" content={RECAPTCHA_SITE_KEY} /> : null}
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
        <CookieBanner gaId={GA_ID} gtmId={GTM_ID} />
        <Script src="/site-script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
