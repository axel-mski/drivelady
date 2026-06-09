import Script from "next/script";
import CookieBanner from "./CookieBanner";
import "../styles.css";
import "../pages.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8b6de",
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700&family=Inter:wght@400;500;600;700;800&display=swap"
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
