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

// Função auxiliar para calcular número da semana
function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7)
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

    console.log(`=== API Vendas ===`)
    console.log(`Período: ${periodo} dias`)
    console.log(`Tipo: ${tipo}`)

    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))
    
    console.log(`Data início: ${dataInicio.toISOString()}`)
    console.log(`Data atual: ${new Date().toISOString()}`)

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
      // Estatísticas diárias usando Prisma groupBy
      const vendasGrouped = await prisma.sale.groupBy({
        by: ['dataVenda'],
        where: {
          dataVenda: {
            gte: dataInicio
          }
        },
        _count: {
          orderId: true
        },
        _sum: {
          subtotal: true
        },
        orderBy: {
          dataVenda: 'asc'
        }
      })

      console.log('Vendas diárias encontradas:', vendasGrouped.length)

      // Preencher dias sem vendas
      for (let i = parseInt(periodo) - 1; i >= 0; i--) {
        const data = new Date()
        data.setDate(data.getDate() - i)
        const dataStr = data.toISOString().split('T')[0]
        
        const venda = vendasGrouped.find(v => {
          const vendaDate = v.dataVenda.toISOString().split('T')[0]
          return vendaDate === dataStr
        })
        
        estatisticas.push({
          data: dataStr,
          vendas: venda?._count.orderId || 0,
          faturamento: venda?._sum.subtotal ? Number(venda._sum.subtotal) : 0
        })
      }
    } else if (tipo === 'weekly') {
      // Estatísticas semanais usando Prisma com agrupamento manual
      console.log('Buscando estatísticas semanais a partir de:', dataInicio)
      
      const todasVendas = await prisma.sale.findMany({
        where: {
          dataVenda: {
            gte: dataInicio
          }
        },
        select: {
          dataVenda: true,
          orderId: true,
          subtotal: true
        }
      })

      console.log('Total vendas encontradas:', todasVendas.length)

      // Agrupar por semana manualmente
      const vendasPorSemana = new Map()
      
      todasVendas.forEach(venda => {
        const data = new Date(venda.dataVenda)
        const ano = data.getFullYear()
        const semana = getWeekNumber(data)
        const chave = `${ano}-${semana}`
        
        if (!vendasPorSemana.has(chave)) {
          vendasPorSemana.set(chave, {
            ano,
            semana,
            vendas: new Set(),
            faturamento: 0,
            dataInicio: data,
            dataFim: data
          })
        }
        
        const grupo = vendasPorSemana.get(chave)
        grupo.vendas.add(venda.orderId)
        grupo.faturamento += Number(venda.subtotal)
        
        if (data < grupo.dataInicio) grupo.dataInicio = data
        if (data > grupo.dataFim) grupo.dataFim = data
      })

      estatisticas = Array.from(vendasPorSemana.values()).map(stat => ({
        data: `${stat.dataInicio.toLocaleDateString('pt-BR')} - ${stat.dataFim.toLocaleDateString('pt-BR')}`,
        vendas: stat.vendas.size,
        faturamento: stat.faturamento,
        periodo: `Semana ${stat.semana}/${stat.ano}`
      })).sort((a, b) => a.periodo.localeCompare(b.periodo))

      console.log('Estatísticas semanais processadas:', estatisticas.length)
      
    } else if (tipo === 'monthly') {
      // Estatísticas mensais usando Prisma com agrupamento manual
      console.log('Buscando estatísticas mensais a partir de:', dataInicio)
      
      const todasVendas = await prisma.sale.findMany({
        where: {
          dataVenda: {
            gte: dataInicio
          }
        },
        select: {
          dataVenda: true,
          orderId: true,
          subtotal: true
        }
      })

      console.log('Total vendas encontradas:', todasVendas.length)

      // Agrupar por mês manualmente
      const vendasPorMes = new Map()
      
      todasVendas.forEach(venda => {
        const data = new Date(venda.dataVenda)
        const ano = data.getFullYear()
        const mes = data.getMonth() + 1
        const chave = `${ano}-${mes}`
        
        if (!vendasPorMes.has(chave)) {
          vendasPorMes.set(chave, {
            ano,
            mes,
            vendas: new Set(),
            faturamento: 0
          })
        }
        
        const grupo = vendasPorMes.get(chave)
        grupo.vendas.add(venda.orderId)
        grupo.faturamento += Number(venda.subtotal)
      })

      const nomesMeses = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ]

      estatisticas = Array.from(vendasPorMes.values()).map(stat => ({
        data: `${nomesMeses[stat.mes - 1]}/${stat.ano}`,
        vendas: stat.vendas.size,
        faturamento: stat.faturamento,
        periodo: `${nomesMeses[stat.mes - 1]}/${stat.ano}`
      })).sort((a, b) => a.periodo.localeCompare(b.periodo))

      console.log('Estatísticas mensais processadas:', estatisticas.length)
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