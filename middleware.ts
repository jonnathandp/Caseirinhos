import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/publico',
    '/loja', 
    '/setup',
    '/api/setup-db',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/auth'
  ]
  
  // APIs específicas que precisam de verificação diferenciada
  const publicApiRoutes = [
    '/api/produtos', // Somente GET permitido sem auth
    '/api/pedidos'   // Somente POST permitido sem auth
  ]
  
  // Rotas administrativas que sempre precisam de autenticação
  const adminRoutes = [
    '/dashboard',
    '/produtos',
    '/pedidos',
    '/clientes', 
    '/estoque',
    '/vendas',
    '/configuracoes'
  ]
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  
  // Permitir rotas públicas sem verificação
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Para APIs públicas, verificar método HTTP
  if (isPublicApiRoute) {
    const method = request.method
    
    if (pathname.startsWith('/api/produtos') && method === 'GET') {
      return NextResponse.next() // Permitir listagem de produtos
    }
    
    if (pathname.startsWith('/api/pedidos') && method === 'POST') {
      return NextResponse.next() // Permitir criação de pedidos
    }
    
    // Para outros métodos (PUT, PATCH, DELETE), verificar autenticação
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  }
  
  // Para rotas administrativas, verificar autenticação
  if (isAdminRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', encodeURI(request.url))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}