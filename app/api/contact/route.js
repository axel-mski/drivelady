const DEFAULT_RECIPIENT = "contact@drivelady.fr";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
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

  const payload = {
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_RECIPIENT,
    subject: `[Drive Lady] ${subject}`,
    replyTo: email,
    name,
    fields: cleanFields(fields),
    receivedAt: new Date().toISOString(),
  };

  try {
    await deliverContactMessage(payload);
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

async function deliverContactMessage(payload) {
  if (process.env.CONTACT_WEBHOOK_URL) {
    const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
        to: payload.to,
        subject: payload.subject,
        reply_to: payload.replyTo,
        text: formatContactMessage(payload),
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
    to: payload.to,
    subject: payload.subject,
    replyTo: payload.replyTo,
    fields: payload.fields,
    receivedAt: payload.receivedAt,
  });
}

function formatContactMessage(payload) {
  const lines = [
    `Nom : ${payload.name}`,
    `E-mail : ${payload.replyTo}`,
    `Recu le : ${payload.receivedAt}`,
    "",
  ];

  Object.entries(payload.fields).forEach(([key, value]) => {
    lines.push(`${key} : ${value}`);
  });

  return lines.join("\n");
}

function cleanFields(fields) {
  const ignored = new Set(["site_web", "website"]);
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
