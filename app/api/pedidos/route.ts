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

export async function POST(request: NextRequest) {
  try {
    const { 
      clienteNome, 
      total, 
      tipoEntrega, 
      endereco, 
      dataEntrega, 
      observacoes, 
      status,
      items 
    } = await request.json()

    console.log('API: Criando novo pedido para cliente:', clienteNome)

    // Criar o pedido
    const pedido = await prisma.order.create({
      data: {
        clienteNome,
        total,
        status: status || 'PENDENTE',
        tipoEntrega: tipoEntrega || 'retirada',
        endereco,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : null,
        observacoes
      }
    })

    // Criar os itens do pedido
    if (items && items.length > 0) {
      await Promise.all(items.map((item: any) => 
        prisma.orderItem.create({
          data: {
            orderId: pedido.id,
            productId: item.productId,
            produtoNome: item.produtoNome,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal
          }
        })
      ))
    }

    // Buscar o pedido completo
    const pedidoCompleto = await prisma.order.findUnique({
      where: { id: pedido.id },
      include: {
        cliente: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log(`API: Pedido ${pedido.id} criado com sucesso`)
    return NextResponse.json(pedidoCompleto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}