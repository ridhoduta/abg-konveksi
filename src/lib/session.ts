import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "default_fallback_secret_keep_it_secure_in_prod";
const encodedKey = new TextEncoder().encode(secretKey);

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is missing in production environment!");
}

export type SessionPayload = {
  userId: number;
  username: string;
  role: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | undefined> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Menghapus console.log agar tidak spam di terminal saat user belum login
    return undefined;
  }
}

export async function createSession(
  userId: number,
  username: string,
  role: string
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, username, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | undefined> {
  // 1. Coba dapatkan session dari cookie
  const cookieStore = await cookies();
  let session = cookieStore.get("session")?.value;

  // 2. Jika tidak ada cookie (misal request dari Flutter), coba dapatkan dari Authorization header
  if (!session) {
    try {
      const headersList = await headers();
      const authHeader = headersList.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        session = authHeader.substring(7);
      }
    } catch (e) {
      // bypass jika headers() dipanggil di konteks non-request
    }
  }

  if (!session) return undefined;
  return await decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
