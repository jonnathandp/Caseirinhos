import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Durante build, retornar status básico
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        status: 'build-time',
        message: 'Health check during build'
      })
    }

    // Testar conexão com banco apenas em produção
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      userCount: userCount,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}