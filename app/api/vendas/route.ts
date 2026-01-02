import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Estatistica {
  data: string
  vendas: number
  faturamento: number
  periodo?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '7' // dias
    const tipo = searchParams.get('tipo') || 'daily' // daily, weekly, monthly

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
          cliente: venda.order.cliente?.nome || 'Cliente não identificado',
          clienteId: venda.order.clienteId,
          produtos: [venda.produtoNome],
          total: parseFloat(venda.subtotal.toString()),
          metodo: venda.order.formaPagamento || 'dinheiro',
          status: venda.order.status
        })
      }
      
      return acc
    }, [])

    // Calcular estatísticas baseadas no tipo de visualização
    let estatisticas: Estatistica[] = []
    
    if (tipo === 'daily') {
      // Estatísticas diárias (código existente)
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

      const stats = estatisticasDiarias.map((stat: any) => ({
        data: stat.data,
        vendas: parseInt(stat.vendas),
        faturamento: parseFloat(stat.faturamento)
      }))

      // Preencher dias sem vendas
      for (let i = parseInt(periodo) - 1; i >= 0; i--) {
        const data = new Date()
        data.setDate(data.getDate() - i)
        const dataStr = data.toISOString().split('T')[0]
        
        const estatistica = stats.find(s => {
          const sData = new Date(s.data).toISOString().split('T')[0]
          return sData === dataStr
        })
        
        estatisticas.push({
          data: dataStr,
          vendas: estatistica?.vendas || 0,
          faturamento: estatistica?.faturamento || 0
        })
      }
    } else if (tipo === 'weekly') {
      // Estatísticas semanais
      const estatisticasSemanais = await prisma.$queryRaw`
        SELECT 
          YEAR(data_venda) as ano,
          WEEK(data_venda, 1) as semana,
          COUNT(DISTINCT order_id) as vendas,
          SUM(subtotal) as faturamento,
          MIN(DATE(data_venda)) as inicio_semana,
          MAX(DATE(data_venda)) as fim_semana
        FROM sales
        WHERE data_venda >= ${dataInicio}
        GROUP BY YEAR(data_venda), WEEK(data_venda, 1)
        ORDER BY ano ASC, semana ASC
      ` as any[]

      estatisticas = estatisticasSemanais.map((stat: any) => ({
        data: `${stat.inicio_semana} - ${stat.fim_semana}`,
        vendas: parseInt(stat.vendas),
        faturamento: parseFloat(stat.faturamento),
        periodo: `Semana ${stat.semana}/${stat.ano}`
      }))
    } else if (tipo === 'monthly') {
      // Estatísticas mensais
      const estatisticasMensais = await prisma.$queryRaw`
        SELECT 
          YEAR(data_venda) as ano,
          MONTH(data_venda) as mes,
          COUNT(DISTINCT order_id) as vendas,
          SUM(subtotal) as faturamento
        FROM sales
        WHERE data_venda >= ${dataInicio}
        GROUP BY YEAR(data_venda), MONTH(data_venda)
        ORDER BY ano ASC, mes ASC
      ` as any[]

      estatisticas = estatisticasMensais.map((stat: any) => {
        const nomesMeses = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ]
        return {
          data: `${nomesMeses[stat.mes - 1]}/${stat.ano}`,
          vendas: parseInt(stat.vendas),
          faturamento: parseFloat(stat.faturamento),
          periodo: `${nomesMeses[stat.mes - 1]}/${stat.ano}`
        }
      })
    }

    return NextResponse.json({
      vendas: vendasPorPedido,
      estatisticas: estatisticas,
      periodo: parseInt(periodo),
      tipo: tipo,
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