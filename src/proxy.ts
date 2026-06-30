import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/directory",
  "/projects",
  "/profile",
  "/connections",
  "/api/users",
  "/api/projects",
  "/api/connections",
];

const authRoutes = ["/login", "/register"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check for NextAuth session cookies
  const hasSecureCookie = req.cookies.has("__Secure-next-auth.session-token");
  const hasNormalCookie = req.cookies.has("next-auth.session-token");
  const hasAuthjsSecure = req.cookies.has("__Secure-authjs.session-token");
  const hasAuthjsNormal = req.cookies.has("authjs.session-token");
  const hasV2Cookie = req.cookies.has("skillsync-v2.session-token");
  
  const isLoggedIn = hasSecureCookie || hasNormalCookie || hasAuthjsSecure || hasAuthjsNormal || hasV2Cookie;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/directory", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
