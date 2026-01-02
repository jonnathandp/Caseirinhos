import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '7' // dias

    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))

    // Buscar vendas (Sales) agrupadas por pedido
    const vendas = await prisma.sale.findMany({
      where: {
        dataVenda: {
          gte: dataInicio
        }
      },
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

    // Agrupar vendas por pedido para exibir
    const vendasPorPedido = vendas.reduce((acc: any[], venda) => {
      const pedidoExistente = acc.find(p => p.id === venda.orderId)
      
      if (pedidoExistente) {
        pedidoExistente.produtos.push(venda.produtoNome)
        pedidoExistente.total = parseFloat(pedidoExistente.total) + parseFloat(venda.subtotal.toString())
      } else {
        acc.push({
          id: venda.orderId,
          data: venda.dataVenda.toISOString(),
          cliente: venda.order.customer?.nome || 'Cliente não identificado',
          clienteId: venda.order.customerId,
          produtos: [venda.produtoNome],
          total: parseFloat(venda.subtotal.toString()),
          metodo: venda.order.formaPagamento || 'dinheiro',
          status: venda.order.status
        })
      }
      
      return acc
    }, [])

    // Calcular estatísticas diárias
    const estatisticasDiarias = await prisma.$queryRaw`
      SELECT 
        DATE(data_venda) as data,
        COUNT(DISTINCT order_id) as vendas,
        SUM(subtotal) as faturamento
      FROM sales
      WHERE data_venda >= ${dataInicio}
      GROUP BY DATE(data_venda)
      ORDER BY DATE(data_venda) ASC
    ` as any[]

    // Formatar estatísticas
    const stats = estatisticasDiarias.map((stat: any) => ({
      data: stat.data,
      vendas: parseInt(stat.vendas),
      faturamento: parseFloat(stat.faturamento)
    }))

    // Preencher dias sem vendas
    const diasCompletos = []
    for (let i = parseInt(periodo) - 1; i >= 0; i--) {
      const data = new Date()
      data.setDate(data.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      
      const estatistica = stats.find(s => {
        const sData = new Date(s.data).toISOString().split('T')[0]
        return sData === dataStr
      })
      
      diasCompletos.push({
        data: dataStr,
        vendas: estatistica?.vendas || 0,
        faturamento: estatistica?.faturamento || 0
      })
    }

    return NextResponse.json({
      vendas: vendasPorPedido,
      estatisticas: diasCompletos,
      resumo: {
        totalVendas: vendasPorPedido.length,
        faturamentoTotal: vendasPorPedido.reduce((sum, v) => sum + v.total, 0),
        ticketMedio: vendasPorPedido.length > 0 
          ? vendasPorPedido.reduce((sum, v) => sum + v.total, 0) / vendasPorPedido.length 
          : 0
      }
    })

  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}