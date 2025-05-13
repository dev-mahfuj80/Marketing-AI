import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/",
];

// API routes that should be accessible without auth
const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/status",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes that need to be public
  if (publicApiPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if this is a public path
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get the token from the cookies
  // Check both possible cookie names your app might be using
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value;

  // ONLY redirect to login if trying to access protected routes without a token
  // This is the most important protection - don't let unauthenticated users access dashboard
  if (!isPublicPath && !token) {
    console.log(`Redirecting to login: ${pathname} (no token)`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Continue with the request if everything is fine
  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, robots.txt, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|manifest.json).*)",
  ],
};
