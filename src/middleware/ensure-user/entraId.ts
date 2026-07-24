import { env } from "cloudflare:workers";
import { AppError } from "@/server/lib/errors";
import {
  getSessionCookieFromHeaders,
  verifySessionCookieValue,
} from "@/lib/entra-session-cookie";
import { resolveDelegatedContext } from "./delegated";
import type { EnsuredUserContext } from "./types";

export async function resolveEntraIdContext(
  headers: Headers,
): Promise<EnsuredUserContext> {
  const sessionSecret = env.ENTRA_SESSION_SECRET;

  if (!sessionSecret) {
    throw new AppError(
      "AUTH_CONFIG_MISSING",
      "Missing Entra ID session configuration",
    );
  }

  const cookieValue = getSessionCookieFromHeaders(headers);

  if (!cookieValue) {
    throw new AppError("UNAUTHENTICATED");
  }

  const email = await verifySessionCookieValue(cookieValue, sessionSecret);

  if (!email) {
    throw new AppError("UNAUTHENTICATED");
  }

  return resolveDelegatedContext(email, email);
}
