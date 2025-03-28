import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Check if the path is public (login page)
  const isPublicPath = path === '/login'
  
  // Get the token from cookies
  const token = request.cookies.get('accessToken')?.value || ''
  
  // If the path is login and user is already logged in, redirect to admin
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // If the path is not login and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the paths that middleware should run on
export const config = {
  matcher: [
    // Apply to all paths except for static files, api routes, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
