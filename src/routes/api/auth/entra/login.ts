import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { isEntraIdAuthMode } from "@/lib/auth-mode";
import { normalizeAuthRedirect } from "@/lib/auth-redirect";

function buildAuthorizeUrl(request: Request) {
  const tenantId = env.ENTRA_TENANT_ID;
  const clientId = env.ENTRA_CLIENT_ID;

  if (!tenantId || !clientId) {
    return null;
  }

  const requestUrl = new URL(request.url);
  const redirectTo = normalizeAuthRedirect(
    requestUrl.searchParams.get("redirect"),
  );
  const redirectUri = new URL("/api/auth/entra/callback", requestUrl.origin);

  const authorizeUrl = new URL(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
  );
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authorizeUrl.searchParams.set("response_mode", "query");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", redirectTo);

  return authorizeUrl;
}

async function handleLoginRequest(request: Request) {
  if (!isEntraIdAuthMode(env.AUTH_MODE)) {
    return new Response("Not found", { status: 404 });
  }

  const authorizeUrl = buildAuthorizeUrl(request);

  if (!authorizeUrl) {
    return new Response("Missing Entra ID configuration", { status: 500 });
  }

  return Response.redirect(authorizeUrl.toString(), 302);
}

export const Route = createFileRoute("/api/auth/entra/login")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleLoginRequest(request);
      },
    },
  },
});
