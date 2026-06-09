import { NextResponse } from "next/server";

const SUPPORT_HOSTS = new Set(["support.localhost", "support.drivelady.fr"]);

export function proxy(request) {
  const host = getRequestHost(request);

  if (!SUPPORT_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (url.pathname.startsWith("/support-portal")) {
    return NextResponse.next();
  }

  url.pathname = `/support-portal${getSupportPortalPath(url.pathname)}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|assets|api|favicon.ico|site-script.js).*)"],
};

function getRequestHost(request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "";

  return host.split(":")[0].replace(/\.$/, "").toLowerCase();
}

function getSupportPortalPath(pathname) {
  if (pathname === "/" || pathname === "/support") {
    return "";
  }

  if (pathname === "/contact" || pathname.startsWith("/contact/")) {
    return "/fr-fr/articles/contacter-support";
  }

  if (pathname === "/fr-fr" || pathname.startsWith("/fr-fr/")) {
    return pathname;
  }

  if (pathname.startsWith("/articles/") || pathname.startsWith("/categories/")) {
    return `/fr-fr${pathname}`;
  }

  return "";
}
