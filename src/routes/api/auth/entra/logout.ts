import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { isEntraIdAuthMode } from "@/lib/auth-mode";
import { buildClearSessionCookieHeader } from "@/lib/entra-session-cookie";

function handleLogoutRequest() {
  if (!isEntraIdAuthMode(env.AUTH_MODE)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": buildClearSessionCookieHeader(),
    },
  });
}

export const Route = createFileRoute("/api/auth/entra/logout")({
  server: {
    handlers: {
      GET: async () => handleLogoutRequest(),
      POST: async () => handleLogoutRequest(),
    },
  },
});
