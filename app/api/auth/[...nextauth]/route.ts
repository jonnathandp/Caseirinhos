import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { default: NextAuth } = await import('next-auth')
  const handler = NextAuth(authOptions)
  return handler(request)
}

export async function GET(request: NextRequest) {
  const { default: NextAuth } = await import('next-auth')
  const handler = NextAuth(authOptions)
  return handler(request)
}