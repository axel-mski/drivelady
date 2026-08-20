const DEFAULT_RECIPIENT = "contact@drivelady.fr";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RECAPTCHA_MIN_SCORE = 0.1;
const recentSubmissions = new Map();

export async function POST(request) {
  let fields;

  try {
    fields = await readFields(request);
  } catch {
    return contactResponse(request, {
      ok: false,
      status: 400,
      message: "Le formulaire est invalide.",
    });
  }

  if (getField(fields, "site_web") || getField(fields, "website")) {
    return contactResponse(request, {
      ok: true,
      message: "Merci, votre message a bien été envoyé.",
    });
  }

  const clientKey = getClientKey(request);
  if (!canSubmit(clientKey)) {
    return contactResponse(request, {
      ok: false,
      status: 429,
      message: "Trop de messages envoyés. Réessayez dans quelques minutes.",
    });
  }

  const email = getField(fields, "email");
  const subject = getField(fields, "sujet") || getField(fields, "subject") || "Contact";
  const message = getField(fields, "message");
  const name = getField(fields, "nom") || getField(fields, "name") || getField(fields, "lieu") || "Contact site";

  if (!isValidEmail(email)) {
    return contactResponse(request, {
      ok: false,
      status: 400,
      message: "Ajoutez une adresse e-mail valide.",
    });
  }

  if (!message && !getField(fields, "lieu")) {
    return contactResponse(request, {
      ok: false,
      status: 400,
      message: "Ajoutez votre message avant l'envoi.",
    });
  }

  const captcha = await verifyRecaptcha(getField(fields, "captchaToken"));

  if (!captcha.ok) {
    return contactResponse(request, {
      ok: false,
      status: 403,
      message: "Verification anti-spam echouee. Rechargez la page et reessayez.",
    });
  }

  const pageSource = resolveSource(request, getField(fields, "source"));

  // Les cles de confiance sont posees apres l'etalement des champs du
  // formulaire : un champ homonyme envoye par un bot ne peut pas les ecraser.
  const submission = {
    ...cleanFields(fields),
    formulaire: getField(fields, "formulaire") || "contact",
    full_source: pageSource.full,
    source: pageSource.path,
    recaptcha_score: captcha.score,
    receivedAt: new Date().toISOString(),
  };

  // Utilise uniquement par le repli e-mail (Resend), pas envoye au webhook.
  const mail = {
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_RECIPIENT,
    subject: `[Drive Lady] ${subject}`,
    replyTo: email,
    name,
  };

  try {
    await deliverContactMessage(submission, mail);
  } catch (error) {
    console.error("Drive Lady contact delivery failed", error);

    return contactResponse(request, {
      ok: false,
      status: 502,
      message: "Le message n'a pas pu être envoyé. Réessayez dans quelques minutes.",
    });
  }

  return contactResponse(request, {
    ok: true,
    message: "Merci, votre message a bien été envoyé.",
  });
}

async function readFields(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  const formData = await request.formData();
  const fields = {};

  formData.forEach((value, key) => {
    fields[key] = typeof value === "string" ? value : value.name;
  });

  return fields;
}

async function deliverContactMessage(submission, mail) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with ${response.status}`);
    }

    return;
  }

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Drive Lady <onboarding@resend.dev>",
        to: mail.to,
        subject: mail.subject,
        reply_to: mail.replyTo,
        text: formatContactMessage(submission, mail),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend failed with ${response.status}`);
    }

    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("No CONTACT_WEBHOOK_URL or RESEND_API_KEY configured");
  }

  console.info("Drive Lady contact form submission", {
    to: mail.to,
    subject: mail.subject,
    replyTo: mail.replyTo,
    submission,
  });
}

function formatContactMessage(submission, mail) {
  const lines = [`Nom : ${mail.name}`, `E-mail : ${mail.replyTo}`, ""];

  Object.entries(submission).forEach(([key, value]) => {
    lines.push(`${key} : ${value}`);
  });

  return lines.join("\n");
}

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // Sans cle secrete configuree, la verification est desactivee (dev local).
  if (!secret) return { ok: true, score: null };

  if (!token) return { ok: false, score: null };

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Drive Lady reCAPTCHA rejected", result["error-codes"]);
      return { ok: false, score: null };
    }

    const score = typeof result.score === "number" ? result.score : null;

    return { ok: score === null || score >= RECAPTCHA_MIN_SCORE, score };
  } catch (error) {
    console.error("Drive Lady reCAPTCHA verification failed", error);
    return { ok: false, score: null };
  }
}

// Le Referer fait foi (un navigateur ne peut pas le falsifier) ; le champ
// envoye par le client ne sert que de repli, sans schema d'URL.
function resolveSource(request, clientSource) {
  const raw = request.headers.get("referer") || (clientSource ? `https://${clientSource}` : "");

  try {
    const url = new URL(raw);
    return { full: `${url.host}${url.pathname}`, path: url.pathname };
  } catch {
    return { full: "", path: "" };
  }
}

function cleanFields(fields) {
  // formulaire / source sont poses par le serveur, pas repris des champs saisis.
  const ignored = new Set(["site_web", "website", "captchaToken", "formulaire", "source", "full_source"]);
  const clean = {};

  Object.entries(fields || {}).forEach(([key, value]) => {
    if (ignored.has(key)) return;
    clean[key] = String(value || "").trim().slice(0, 4000);
  });

  return clean;
}

function getField(fields, key) {
  return String(fields?.[key] || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function canSubmit(key) {
  const now = Date.now();
  const previous = recentSubmissions.get(key) || [];
  const current = previous.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (current.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(key, current);
    return false;
  }

  current.push(now);
  recentSubmissions.set(key, current);
  return true;
}

function getClientKey(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function contactResponse(request, { ok, message, status = ok ? 200 : 400 }) {
  if (!expectsJson(request)) {
    const redirectUrl = new URL("/contact/", request.url);
    redirectUrl.searchParams.set(ok ? "sent" : "error", ok ? "1" : "1");

    return Response.redirect(redirectUrl, 303);
  }

  return Response.json({ ok, message }, { status });
}

function expectsJson(request) {
  return (request.headers.get("accept") || "").includes("application/json");
}
