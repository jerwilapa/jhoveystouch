import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "jhoveys_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getAdminConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || password.length < 16) {
    throw new Error("ADMIN_PASSWORD must be configured with at least 16 characters.");
  }
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be configured with at least 32 characters.");
  }

  return { password, sessionSecret };
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyAdminPassword(candidate: string): boolean {
  const { password } = getAdminConfig();
  const expected = createHash("sha256").update(password).digest();
  const actual = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(expected, actual);
}

export function createAdminSession(): { value: string; maxAge: number } {
  const { sessionSecret } = getAdminConfig();
  const maxAge = SESSION_DURATION_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Math.floor(Date.now() / 1000) + maxAge }),
  ).toString("base64url");

  return {
    value: `${payload}.${signature(payload, sessionSecret)}`,
    maxAge,
  };
}

export function hasValidAdminSession(request: NextRequest): boolean {
  const { sessionSecret } = getAdminConfig();
  const value = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;

  const [payload, providedSignature, extra] = value.split(".");
  if (!payload || !providedSignature || extra) return false;

  const expectedSignature = Buffer.from(signature(payload, sessionSecret));
  const actualSignature = Buffer.from(providedSignature);
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return false;
  }

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("expiresAt" in decoded) ||
      typeof decoded.expiresAt !== "number"
    ) {
      return false;
    }
    return decoded.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(
  response: NextResponse,
  session: { value: string; maxAge: number },
): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
