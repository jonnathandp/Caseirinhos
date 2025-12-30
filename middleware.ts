import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir acesso às páginas de setup e API setup
  if (pathname.startsWith('/setup') || 
      pathname.startsWith('/api/setup-db') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}