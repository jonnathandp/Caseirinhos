import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pedidos = await prisma.order.findMany({
      include: {
        cliente: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { dataPedido: 'desc' },
      take: 50
    })

    console.log(`API: ${pedidos.length} pedidos encontrados`)
    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: 'Erro ao carregar pedidos' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    
    console.log(`API: Atualizando pedido ${id} para status ${status}`)
    
    const pedido = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        cliente: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log(`API: Pedido ${id} atualizado com sucesso`)
    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}