const COOKIE_NAME = "entra_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

type SessionPayload = {
  email: string;
  exp: number;
};

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string, secret: string) {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Cookie stateless (pas de session serveur, cf. runtime Workers) : le payload
 * est en clair mais signé HMAC, donc infalsifiable sans le secret.
 */
export async function createSessionCookieValue(email: string, secret: string) {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encodedPayload = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionCookieValue(
  cookieValue: string,
  secret: string,
): Promise<string | null> {
  const [encodedPayload, signature] = cookieValue.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload, secret);
  if (expectedSignature !== signature) {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload)),
    );
  } catch {
    return null;
  }

  if (typeof payload.email !== "string" || typeof payload.exp !== "number") {
    return null;
  }

  if (payload.exp < Date.now()) {
    return null;
  }

  return payload.email;
}

export function buildSessionCookieHeader(cookieValue: string) {
  const maxAgeSeconds = Math.floor(SESSION_DURATION_MS / 1000);
  return `${COOKIE_NAME}=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

export function buildClearSessionCookieHeader() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getSessionCookieFromHeaders(headers: Headers): string | null {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  return match.slice(COOKIE_NAME.length + 1);
}
