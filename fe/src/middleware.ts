import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/dashboard/posts',
  '/dashboard/create-post',
  '/dashboard/settings',
];

// Define paths that are only accessible for non-authenticated users
const authPaths = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Check for authentication token in cookies
  const hasAuthCookie = request.cookies.has('accessToken');
  
  // Redirect authenticated users away from auth pages (login/register)
  if (isAuthPath && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login page from protected routes
  if (isProtectedPath && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - api routes (backend API)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
