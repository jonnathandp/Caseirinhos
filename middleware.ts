import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/publico',
    '/loja',
    '/api/produtos', // Permitir acesso aos produtos para a loja
    '/api/pedidos',  // Permitir criação de pedidos pelos clientes
    '/setup',
    '/api/setup-db',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/auth'
  ]
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}