import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET || "mohsin-designs-secret-key-change-me-in-env");

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
