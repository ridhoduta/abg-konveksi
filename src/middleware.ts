import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// 1. Specify protected and public routes
const protectedRoutes = ["/pages/admin", "/pages/kasir"];
const publicRoutes = ["/pages/login", "/"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // 4. Redirect to /pages/login if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/pages/login", req.nextUrl));
  }

  // 5. Role-based protection
  if (path.startsWith("/pages/admin") && session?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.redirect(new URL("/pages/login", req.nextUrl));
  }

  if (path.startsWith("/pages/kasir") && session?.role?.toUpperCase() !== "KASIR") {
    return NextResponse.redirect(new URL("/pages/login", req.nextUrl));
  }

  // 6. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session &&
    !req.nextUrl.pathname.startsWith("/pages/admin") &&
    !req.nextUrl.pathname.startsWith("/pages/kasir")
  ) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/pages/admin", req.nextUrl));
    }
    if (session.role === "KASIR") {
      return NextResponse.redirect(new URL("/pages/kasir", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
