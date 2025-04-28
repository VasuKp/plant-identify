import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-2fa',
];

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/cart',
  '/checkout',
  '/wishlist',
  '/settings',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's an API route that doesn't require protection
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/me')) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.split(' ')[1];
  
  // Get user data from cookie if available
  let userData = null;
  try {
    const userDataCookie = request.cookies.get('userData')?.value;
    if (userDataCookie) {
      userData = JSON.parse(decodeURIComponent(userDataCookie));
    }
  } catch (error) {
    console.error('Error parsing user data cookie:', error);
  }
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  // Check if route is admin-only
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(redirectUrl);
  }
  
  // If it's an admin route and user is not admin, redirect to home
  if (isAdminRoute && (!token || userData?.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is already authenticated and trying to access login/signup pages, redirect to profile
  if (token && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)'],
}; 