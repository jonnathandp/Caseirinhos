import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const products = await prisma.product.findMany()
    const customers = await prisma.customer.findMany()

    if (products.length === 0 || customers.length === 0) {
      return NextResponse.json({ error: 'Sem produtos ou clientes no banco' }, { status: 400 })
    }

    const pedidosCriados = []

    for (let i = 0; i < 15; i++) {
      const dataVenda = new Date()
      dataVenda.setDate(dataVenda.getDate() - Math.floor(Math.random() * 7))
      
      const cliente = customers[Math.floor(Math.random() * customers.length)]
      const numProdutos = Math.floor(Math.random() * 3) + 1
      
      let totalPedido = 0
      const items = []
      
      for (let j = 0; j < numProdutos; j++) {
        const produto = products[Math.floor(Math.random() * products.length)]
        const quantidade = Math.floor(Math.random() * 3) + 1
        const subtotal = Number(produto.preco) * quantidade
        totalPedido += subtotal
        
        items.push({
          productId: produto.id,
          produtoNome: produto.nome,
          quantidade,
          precoUnitario: produto.preco,
          subtotal
        })
      }
      
      const order = await prisma.order.create({
        data: {
          clienteNome: cliente.nome,
          total: totalPedido,
          status: ['CONFIRMADO', 'ENTREGUE'][Math.floor(Math.random() * 2)] as any,
          tipoEntrega: ['retirada', 'entrega'][Math.floor(Math.random() * 2)],
          formaPagamento: ['Dinheiro', 'Cartão', 'Pix'][Math.floor(Math.random() * 3)],
          dataPedido: dataVenda,
          cliente: {
            connect: { id: cliente.id }
          },
          items: {
            create: items
          }
        }
      })
      
      for (const item of items) {
        await prisma.sale.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            produtoNome: item.produtoNome,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal,
            dataVenda
          }
        })
      }
      
      pedidosCriados.push({
        id: order.id,
        cliente: cliente.nome,
        total: totalPedido,
        items: items.length
      })
    }

    return NextResponse.json({
      success: true,
      message: `${pedidosCriados.length} pedidos criados com sucesso`,
      pedidos: pedidosCriados
    })
  } catch (error: any) {
    console.error('Erro ao criar vendas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
