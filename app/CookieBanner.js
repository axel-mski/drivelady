"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "drive-lady-cookie-consent";
const DISMISSAL_STORAGE_KEY = "drive-lady-cookie-banner-dismissed-until";
const DISMISSAL_DURATION_MS = 24 * 60 * 60 * 1000;

function normalizeConsent(value) {
  return value === "granted" || value === "denied" ? value : null;
}

function applyConsent(value) {
  if (typeof window === "undefined" || !window.gtag) return;

  const state = value === "granted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
}

function consentPayload(value) {
  const state = value === "granted" ? "granted" : "denied";

  return {
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    wait_for_update: 500,
  };
}

function getCookieDomainCandidates(hostname) {
  if (!hostname || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return [null];
  }

  const parts = hostname.split(".").filter(Boolean);
  const domains = [null, hostname, `.${hostname}`];

  for (let i = 1; i < parts.length - 1; i += 1) {
    const domain = parts.slice(i).join(".");
    domains.push(domain, `.${domain}`);
  }

  return Array.from(new Set(domains));
}

function deleteGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;

  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(
      (name) =>
        name &&
        (name === "_ga" ||
          name === "_gid" ||
          name === "_gat" ||
          name.startsWith("_ga_") ||
          name.startsWith("_gat_") ||
          name.startsWith("_gcl_")),
    );

  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  const domains = getCookieDomainCandidates(window.location.hostname);

  for (const name of names) {
    document.cookie = `${name}=; Expires=${expires}; Max-Age=0; Path=/; SameSite=Lax`;

    for (const domain of domains) {
      if (!domain) continue;
      document.cookie = `${name}=; Expires=${expires}; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
}

function removeGoogleAnalyticsScripts(gaId) {
  if (typeof document === "undefined") return;

  document.querySelectorAll("script[data-drive-lady-ga]").forEach((script) => {
    if (script.dataset.driveLadyGa === gaId) {
      script.remove();
    }
  });

  document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach((script) => {
    const source = script.getAttribute("src") || "";
    if (source.includes(`id=${gaId}`) || source.includes(`id=${encodeURIComponent(gaId)}`)) {
      script.remove();
    }
  });
}

function removeGoogleTagManagerScripts(gtmId) {
  if (typeof document === "undefined") return;

  document.querySelectorAll("script[data-drive-lady-gtm]").forEach((script) => {
    if (script.dataset.driveLadyGtm === gtmId) {
      script.remove();
    }
  });

  document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]').forEach((script) => {
    const source = script.getAttribute("src") || "";
    if (source.includes(`id=${gtmId}`) || source.includes(`id=${encodeURIComponent(gtmId)}`)) {
      script.remove();
    }
  });
}

function ensureGoogleTagStub() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // Google Tag expects the native arguments object here.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
}

// Le conteneur GTM n'est injecte qu'apres accord explicite : tant que le
// visiteur n'a pas accepte, aucune requete Google n'est emise et aucun cookie
// n'est depose. Le consentement par defaut est pose avant tout chargement,
// pour que les balises du conteneur qui verifient le consent mode le voient.
function loadGoogleTagManager(gtmId, consent) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  ensureGoogleTagStub();
  window.gtag("consent", "default", consentPayload(consent));

  if (consent !== "granted") {
    deleteGoogleAnalyticsCookies();
    return;
  }

  if (document.querySelector(`script[data-drive-lady-gtm="${gtmId}"]`)) return;

  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  script.dataset.driveLadyGtm = gtmId;
  document.head.appendChild(script);
}

function disableGoogleTagManager(gtmId) {
  applyConsent("denied");
  removeGoogleTagManagerScripts(gtmId);
  deleteGoogleAnalyticsCookies();
  window.setTimeout(deleteGoogleAnalyticsCookies, 250);
  window.setTimeout(deleteGoogleAnalyticsCookies, 1000);
}

function setGoogleAnalyticsDisabled(gaId, disabled) {
  if (typeof window === "undefined") return;
  window[`ga-disable-${gaId}`] = disabled;
}

function trackGoogleAnalyticsPageView(gaId, force = false) {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.gtag) return;

  const pageLocation = window.location.href;
  if (!force && window.__driveLadyGaLastPageView === pageLocation) return;

  const pageReferrer = window.__driveLadyGaPreviousPageLocation || document.referrer || undefined;
  window.__driveLadyGaLastPageView = pageLocation;
  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: pageLocation,
    page_path: `${window.location.pathname}${window.location.search}`,
    ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
    send_to: gaId,
  });
  window.__driveLadyGaPreviousPageLocation = pageLocation;
}

function resetGoogleTagState() {
  window.__driveLadyGaConfigured = false;
  window.__driveLadyGaLastPageView = undefined;
  window.__driveLadyGaPreviousPageLocation = undefined;
  window.dataLayer = [];
  window.gtag = undefined;
}

function disableGoogleAnalytics(gaId) {
  setGoogleAnalyticsDisabled(gaId, true);
  applyConsent("denied");
  deleteGoogleAnalyticsCookies();
  window.setTimeout(deleteGoogleAnalyticsCookies, 250);
  window.setTimeout(deleteGoogleAnalyticsCookies, 1000);
  removeGoogleAnalyticsScripts(gaId);
  resetGoogleTagState();
}

function loadGoogleAnalytics(gaId, consent) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  ensureGoogleTagStub();
  setGoogleAnalyticsDisabled(gaId, consent === "denied");
  window.gtag("consent", "default", consentPayload(consent));

  if (consent === "denied") {
    deleteGoogleAnalyticsCookies();
    return;
  }

  if (!document.querySelector(`script[data-drive-lady-ga="${gaId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    script.dataset.driveLadyGa = gaId;
    document.head.appendChild(script);
  }

  if (!window.__driveLadyGaConfigured) {
    window.gtag("js", new Date());
    window.__driveLadyGaConfigured = true;
  }

  window.gtag("config", gaId, { anonymize_ip: true, send_page_view: false });
  trackGoogleAnalyticsPageView(gaId, true);
}

function safeStorageGet(key) {
  try {
    return normalizeConsent(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Consent will be requested again if browser storage is unavailable.
  }
}

function isCookieBannerDismissed() {
  try {
    const dismissedUntil = Number(localStorage.getItem(DISMISSAL_STORAGE_KEY));

    if (!Number.isFinite(dismissedUntil)) return false;

    if (Date.now() < dismissedUntil) {
      return true;
    }

    localStorage.removeItem(DISMISSAL_STORAGE_KEY);
    return false;
  } catch {
    return false;
  }
}

function dismissCookieBannerFor24Hours() {
  try {
    localStorage.setItem(DISMISSAL_STORAGE_KEY, String(Date.now() + DISMISSAL_DURATION_MS));
  } catch {
    // If storage is unavailable, the close action still hides the banner for this render.
  }
}

function isMobileCookieViewport() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 640px)").matches;
}

function CookieGlyph({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <circle cx="8.5" cy="8.5" r=".5" fill="#fff" />
      <circle cx="15.5" cy="11.5" r=".5" fill="#fff" />
      <circle cx="10.5" cy="14.5" r=".5" fill="#fff" />
      <circle cx="14.5" cy="16.5" r=".5" fill="#fff" />
    </svg>
  );
}

export default function CookieBanner({ gaId, gtmId }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const saved = safeStorageGet(STORAGE_KEY);
    const consent = saved === "granted" ? "granted" : "denied";

    if (gaId) {
      loadGoogleAnalytics(gaId, consent);
    }

    if (gtmId) {
      loadGoogleTagManager(gtmId, consent);
    }

    const defer = typeof queueMicrotask === "function" ? queueMicrotask : (callback) => window.setTimeout(callback, 0);
    defer(() => {
      setMounted(true);
      setBannerOpen(saved === null && !isCookieBannerDismissed() && !isMobileCookieViewport());
    });
  }, [gaId, gtmId]);

  useEffect(() => {
    if (!mounted || !gaId || safeStorageGet(STORAGE_KEY) !== "granted") return;
    trackGoogleAnalyticsPageView(gaId);
  }, [gaId, mounted, pathname]);

  if (!mounted) return null;

  const saveAndClose = (value) => {
    safeStorageSet(STORAGE_KEY, value);

    if (value === "granted") {
      if (gaId) loadGoogleAnalytics(gaId, "granted");
      if (gtmId) loadGoogleTagManager(gtmId, "granted");
      applyConsent("granted");
    } else {
      // GTM d'abord : disableGoogleAnalytics libere window.gtag a la fin.
      if (gtmId) disableGoogleTagManager(gtmId);
      if (gaId) disableGoogleAnalytics(gaId);
      else if (gtmId) resetGoogleTagState();
    }

    setBannerOpen(false);
  };

  const closeWithoutConsent = () => {
    dismissCookieBannerFor24Hours();
    setBannerOpen(false);
  };

  return (
    <>
      <style>{`
        .dl-cookie {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 9000;
          width: calc(100% - 48px);
          max-width: 440px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid rgba(108, 48, 78, 0.08);
          box-shadow: 0 20px 60px rgba(108, 48, 78, 0.16), 0 4px 16px rgba(23, 15, 19, 0.06);
          font-family: var(--font-display, "Arimo", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
          animation: dl-cookie-in .4s cubic-bezier(.16,1,.3,1);
        }

        @keyframes dl-cookie-in {
          from { opacity: 0; transform: translateY(24px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dl-cookie-inner {
          padding: 1.5rem 1.5rem 1.25rem;
          position: relative;
        }

        .dl-cookie-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #9b8c97;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color .15s, color .15s;
        }

        .dl-cookie-close:hover,
        .dl-cookie-close:focus-visible {
          background: #faf8f5;
          color: #170f13;
        }

        .dl-cookie-head {
          display: flex;
          align-items: center;
          gap: .65rem;
          margin-bottom: .85rem;
          padding-right: 32px;
        }

        .dl-cookie-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #e4cdd9 24%, #eee2e8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(228, 205, 217, 0.42);
        }

        .dl-cookie-eyebrow {
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #6f626d;
        }

        .dl-cookie-title {
          font-size: 1.125rem;
          font-weight: 800;
          line-height: 1.25;
          margin: 0 0 .5rem;
          color: #170f13;
          letter-spacing: 0;
        }

        .dl-cookie-body {
          font-size: .8rem;
          line-height: 1.55;
          color: #6f626d;
          margin: 0 0 1.25rem;
        }

        .dl-cookie-link {
          color: #8e4b6d;
          text-decoration: none;
          font-weight: 700;
          position: relative;
        }

        .dl-cookie-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, #e4cdd9, #eee2e8);
          opacity: .45;
          transition: opacity .15s;
        }

        .dl-cookie-link:hover::after,
        .dl-cookie-link:focus-visible::after {
          opacity: 1;
        }

        .dl-cookie-actions {
          display: flex;
          gap: .8rem;
          padding-top: 1.1rem;
          border-top: 1px solid #ece0e6;
        }

        .dl-cookie-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.9rem;
          padding: 0 1.35rem;
          border-radius: 999px;
          font-family: inherit;
          font-size: .9rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform .22s cubic-bezier(.16,1,.3,1),
            box-shadow .22s cubic-bezier(.16,1,.3,1),
            background .22s cubic-bezier(.16,1,.3,1),
            border-color .22s cubic-bezier(.16,1,.3,1);
          border: 1px solid transparent;
          background: transparent;
          letter-spacing: 0;
        }

        .dl-cookie-btn.ghost {
          color: var(--pink-800, #6c304e);
          border-color: rgba(142, 75, 109, 0.2);
          background: #fcfbf9;
        }

        .dl-cookie-btn.ghost:hover,
        .dl-cookie-btn.ghost:focus-visible {
          border-color: rgba(142, 75, 109, 0.38);
          background: #f7f2ec;
        }

        .dl-cookie-btn.primary {
          color: #ffffff;
          background: linear-gradient(180deg, #9d5679, #8e4b6d);
          box-shadow:
            0 16px 30px -18px rgba(142, 75, 109, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.42);
        }

        .dl-cookie-btn.primary:hover,
        .dl-cookie-btn.primary:focus-visible {
          background: linear-gradient(180deg, #a05a7c, #7d4160);
          transform: translateY(-1px);
          box-shadow:
            0 20px 40px -20px rgba(142, 75, 109, 0.88),
            inset 0 1px 0 rgba(255, 255, 255, 0.46);
        }

        .dl-cookie-toggle {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 8999;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e4cdd9 24%, #eee2e8 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(142, 75, 109, 0.32), 0 2px 8px rgba(23, 15, 19, 0.1);
          transition: transform .2s ease, box-shadow .2s ease;
          animation: dl-cookie-toggle-in .35s cubic-bezier(.16,1,.3,1);
        }

        @keyframes dl-cookie-toggle-in {
          from { opacity: 0; transform: scale(.6); }
          to { opacity: 1; transform: scale(1); }
        }

        .dl-cookie-toggle:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 32px rgba(142, 75, 109, 0.42), 0 2px 8px rgba(23, 15, 19, 0.14);
        }

        .dl-cookie-toggle:focus-visible,
        .dl-cookie-btn:focus-visible {
          outline: 2px solid #8e4b6d;
          outline-offset: 3px;
        }

        @media (max-width: 640px) {
          .dl-cookie {
            left: 16px;
            right: 16px;
            bottom: max(16px, env(safe-area-inset-bottom));
            width: auto;
          }

          .dl-cookie-inner {
            padding: 1.25rem;
          }

          .dl-cookie-actions {
            flex-direction: column-reverse;
          }

          .dl-cookie-toggle {
            left: 16px;
            bottom: max(16px, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      {bannerOpen ? (
        <div role="dialog" aria-label="Préférences de confidentialité" className="dl-cookie">
          <div className="dl-cookie-inner">
            <button type="button" className="dl-cookie-close" onClick={closeWithoutConsent} aria-label="Fermer">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="dl-cookie-head">
              <span className="dl-cookie-icon">
                <CookieGlyph size={20} />
              </span>
              <div className="dl-cookie-eyebrow">Confidentialité</div>
            </div>

            <h2 className="dl-cookie-title">Quelques cookies pour améliorer votre expérience</h2>
            <p className="dl-cookie-body">
              Nous utilisons des cookies nécessaires au bon fonctionnement du site. Avec votre accord, Drive Lady peut
              aussi mesurer l'audience pour améliorer l'expérience.
              <br />
              <a href="/politique-de-confidentialite/" className="dl-cookie-link">
                Politique de confidentialité
              </a>
            </p>

            <div className="dl-cookie-actions">
              <button type="button" onClick={() => saveAndClose("denied")} className="dl-cookie-btn ghost">
                Refuser
              </button>
              <button type="button" onClick={() => saveAndClose("granted")} className="dl-cookie-btn primary">
                Accepter
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="dl-cookie-toggle"
          onClick={() => setBannerOpen(true)}
          aria-label="Modifier mes préférences cookies"
          title="Préférences cookies"
        >
          <CookieGlyph size={22} />
        </button>
      )}
    </>
  );
}
