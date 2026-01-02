import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Testar conexão básica
    await prisma.$connect()
    
    // Testar query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    // Contar registros nas principais tabelas
    let orderCount = 0
    let itemCount = 0
    
    try {
      orderCount = await prisma.order.count()
      itemCount = await prisma.orderItem.count()
    } catch (tableError) {
      console.warn('Erro ao contar registros:', tableError)
    }
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      query_test: result,
      tables: tables,
      counts: {
        orders: orderCount,
        orderItems: itemCount
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}