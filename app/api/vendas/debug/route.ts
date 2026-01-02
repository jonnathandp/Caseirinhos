import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Testar conexão e dados sem autenticação
    const salesCount = await prisma.sale.count()
    const sales = await prisma.sale.findMany({
      take: 5,
      include: {
        order: {
          include: {
            cliente: true
          }
        },
        product: true
      },
      orderBy: {
        dataVenda: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      salesCount,
      sampleSales: sales.map(sale => ({
        id: sale.id,
        orderId: sale.orderId,
        produtoNome: sale.produtoNome,
        quantidade: sale.quantidade,
        subtotal: sale.subtotal.toString(),
        dataVenda: sale.dataVenda.toISOString(),
        hasOrder: !!sale.order,
        hasProduct: !!sale.product,
        hasCliente: !!sale.order?.cliente
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}