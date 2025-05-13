import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a public path
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  
  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value;
  
  // If the path is for dashboard and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // If the user is on login/register but already has a token, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
