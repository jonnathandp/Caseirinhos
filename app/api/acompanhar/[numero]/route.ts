import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { numero: string } }
) {
  try {
    const numero = params.numero

    if (!numero) {
      return NextResponse.json(
        { error: 'Número do pedido é obrigatório' }, 
        { status: 400 }
      )
    }

    // Buscar todos os pedidos e filtrar pelo número
    const pedidos = await prisma.order.findMany({
      include: {
        cliente: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { dataPedido: 'desc' }
    })

    // Encontrar o pedido pelo número (baseado no índice)
    const pedidoIndex = parseInt(numero) - 1
    const pedido = pedidos.reverse()[pedidoIndex]

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Mapear para o formato esperado pelo frontend
    const orderResponse = {
      id: pedido.id,
      numero: numero.padStart(3, '0'),
      clienteNome: pedido.cliente?.nome || pedido.clienteNome,
      total: Number(pedido.total),
      formaPagamento: pedido.formaPagamento || 'Não informado',
      tipoEntrega: pedido.tipoEntrega || 'retirada',
      endereco: pedido.endereco,
      status: pedido.status,
      dataPedido: pedido.dataPedido.toISOString(),
      dataEntrega: pedido.dataEntrega?.toISOString(),
      observacoes: pedido.observacoes,
      items: pedido.items.map(item => ({
        produto: item.produtoNome || item.product?.nome || 'Produto',
        quantidade: item.quantidade,
        preco: Number(item.precoUnitario)
      }))
    }

    return NextResponse.json(orderResponse)
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}