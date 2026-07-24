import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { isEntraIdAuthMode } from "@/lib/auth-mode";
import { normalizeAuthRedirect } from "@/lib/auth-redirect";
import {
  buildSessionCookieHeader,
  createSessionCookieValue,
} from "@/lib/entra-session-cookie";

const ALLOWED_EMAIL_DOMAIN = "@wefiit.com";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(tenantId: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(
        `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      ),
    );
  }
  return jwks;
}

async function exchangeCodeForIdToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const tenantId = env.ENTRA_TENANT_ID;
  const clientId = env.ENTRA_CLIENT_ID;
  const clientSecret = env.ENTRA_CLIENT_SECRET;

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId ?? "",
        client_secret: clientSecret ?? "",
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Token exchange failed with status ${response.status}`);
  }

  const body = (await response.json()) as { id_token?: string };

  if (!body.id_token) {
    throw new Error("Token response is missing id_token");
  }

  return body.id_token;
}

async function verifyIdTokenAndGetEmail(idToken: string): Promise<string> {
  const tenantId = env.ENTRA_TENANT_ID;
  const clientId = env.ENTRA_CLIENT_ID;

  const { payload } = await jwtVerify(idToken, getJwks(tenantId ?? ""), {
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    audience: clientId,
  });

  const email = payload.preferred_username ?? payload.email;

  if (typeof email !== "string" || !email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
    throw new Error(`Compte non autorise : ${String(email ?? "email absent")}`);
  }

  return email.toLowerCase();
}

async function handleCallbackRequest(request: Request) {
  if (!isEntraIdAuthMode(env.AUTH_MODE)) {
    return new Response("Not found", { status: 404 });
  }

  if (!env.ENTRA_TENANT_ID || !env.ENTRA_CLIENT_ID || !env.ENTRA_CLIENT_SECRET) {
    return new Response("Missing Entra ID configuration", { status: 500 });
  }

  if (!env.ENTRA_SESSION_SECRET) {
    return new Response("Missing Entra ID session configuration", {
      status: 500,
    });
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = normalizeAuthRedirect(requestUrl.searchParams.get("state"));

  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  const redirectUri = new URL(
    "/api/auth/entra/callback",
    requestUrl.origin,
  ).toString();

  try {
    const idToken = await exchangeCodeForIdToken(code, redirectUri);
    const email = await verifyIdTokenAndGetEmail(idToken);
    const cookieValue = await createSessionCookieValue(
      email,
      env.ENTRA_SESSION_SECRET,
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
        "Set-Cookie": buildSessionCookieHeader(cookieValue),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return new Response(`Authentication failed: ${message}`, { status: 403 });
  }
}

export const Route = createFileRoute("/api/auth/entra/callback")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleCallbackRequest(request);
      },
    },
  },
});
