import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Resolved lazily: throwing at import time would take down middleware and every public page.
function getSecret() {
  const raw = process.env.ADMIN_SESSION_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(raw || "dev-only-insecure-admin-session-secret-not-for-prod");
  }
  throw new Error("ADMIN_SESSION_SECRET must be set (at least 32 characters)");
}

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getAuthSession(req?: NextRequest) {
  let token: string | undefined;

  if (req && req.cookies) {
    token = req.cookies.get("mohsin_admin_session")?.value;
  }

  if (!token && req) {
    const rawCookie = req.headers.get("cookie");
    if (rawCookie) {
      const match = rawCookie.match(/mohsin_admin_session=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("mohsin_admin_session")?.value;
    } catch {
      // Ignore if cookies() is called outside request context
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}
