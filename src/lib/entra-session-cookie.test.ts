import { describe, expect, it } from "vitest";
import {
  buildClearSessionCookieHeader,
  buildSessionCookieHeader,
  createSessionCookieValue,
  getSessionCookieFromHeaders,
  verifySessionCookieValue,
} from "./entra-session-cookie";

const SECRET = "test-secret-at-least-32-characters-long";

describe("entra session cookie", () => {
  it("round-trips a signed session for a valid secret", async () => {
    const cookieValue = await createSessionCookieValue(
      "antoine.simonian@wefiit.com",
      SECRET,
    );

    const email = await verifySessionCookieValue(cookieValue, SECRET);
    expect(email).toBe("antoine.simonian@wefiit.com");
  });

  it("rejects a cookie signed with a different secret", async () => {
    const cookieValue = await createSessionCookieValue(
      "antoine.simonian@wefiit.com",
      SECRET,
    );

    const email = await verifySessionCookieValue(cookieValue, "wrong-secret");
    expect(email).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const cookieValue = await createSessionCookieValue(
      "antoine.simonian@wefiit.com",
      SECRET,
    );
    const [, signature] = cookieValue.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ email: "attacker@evil.com", exp: Date.now() + 1000 }),
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const email = await verifySessionCookieValue(
      `${tamperedPayload}.${signature}`,
      SECRET,
    );
    expect(email).toBeNull();
  });

  it("rejects a malformed cookie value", async () => {
    expect(
      await verifySessionCookieValue("not-a-valid-cookie", SECRET),
    ).toBeNull();
    expect(await verifySessionCookieValue("", SECRET)).toBeNull();
  });

  it("rejects an expired session", async () => {
    const encodedPayload = Buffer.from(
      JSON.stringify({
        email: "antoine.simonian@wefiit.com",
        exp: Date.now() - 1000,
      }),
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBytes = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(encodedPayload),
      ),
    );
    const signature = Buffer.from(signatureBytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const email = await verifySessionCookieValue(
      `${encodedPayload}.${signature}`,
      SECRET,
    );
    expect(email).toBeNull();
  });

  it("builds a Set-Cookie header with expected attributes", () => {
    const header = buildSessionCookieHeader("some-value");
    expect(header).toContain("entra_session=some-value");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Path=/");
  });

  it("builds a clearing Set-Cookie header", () => {
    const header = buildClearSessionCookieHeader();
    expect(header).toContain("entra_session=;");
    expect(header).toContain("Max-Age=0");
  });

  it("extracts the session cookie value from a Cookie header", () => {
    const headers = new Headers({
      cookie: "other=1; entra_session=abc.def; another=2",
    });
    expect(getSessionCookieFromHeaders(headers)).toBe("abc.def");
  });

  it("returns null when the cookie is absent", () => {
    const headers = new Headers();
    expect(getSessionCookieFromHeaders(headers)).toBeNull();
  });
});
