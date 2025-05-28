import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/",
];

const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/status",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicApiPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value;

  if (!isPublicPath && !token) {
    console.log(`Redirecting to login: ${pathname} (no token)`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|manifest.json).*)",
  ],
};
