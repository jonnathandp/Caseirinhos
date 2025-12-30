import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o banco está configurado
    try {
      await prisma.user.findFirst()
    } catch (dbError) {
      return NextResponse.json({
        vendas: { hoje: 0, semana: 0, mes: 0 },
        pedidos: { total: 0, pendentes: 0, prontos: 0 },
        produtos: { total: 0, estoqueBaixo: 0 },
        clientes: { total: 0, novos: 0 }
      })
    }

    // Datas para consultas
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    // Buscar dados com tratamento de erro individual
    const [vendasHoje, vendasSemana, vendasMes, totalPedidos, pedidosPendentes, pedidosProntos, totalProdutos, produtosEstoqueBaixo, totalClientes, clientesNovos] = await Promise.allSettled([
      prisma.sale.aggregate({
        where: { dataVenda: { gte: hoje, lt: amanha } },
        _sum: { subtotal: true }
      }),
      prisma.sale.aggregate({
        where: { dataVenda: { gte: inicioSemana } },
        _sum: { subtotal: true }
      }),
      prisma.sale.aggregate({
        where: { dataVenda: { gte: inicioMes } },
        _sum: { subtotal: true }
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDENTE' } }),
      prisma.order.count({ where: { status: 'PRONTO' } }),
      prisma.product.count({ where: { ativo: true } }),
      prisma.stock.count(),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: inicioMes } } })
    ])

    const stats = {
      vendas: {
        hoje: vendasHoje.status === 'fulfilled' ? (vendasHoje.value._sum.subtotal?.toNumber() || 0) : 0,
        semana: vendasSemana.status === 'fulfilled' ? (vendasSemana.value._sum.subtotal?.toNumber() || 0) : 0,
        mes: vendasMes.status === 'fulfilled' ? (vendasMes.value._sum.subtotal?.toNumber() || 0) : 0
      },
      pedidos: {
        total: totalPedidos.status === 'fulfilled' ? totalPedidos.value : 0,
        pendentes: pedidosPendentes.status === 'fulfilled' ? pedidosPendentes.value : 0,
        prontos: pedidosProntos.status === 'fulfilled' ? pedidosProntos.value : 0
      },
      produtos: {
        total: totalProdutos.status === 'fulfilled' ? totalProdutos.value : 0,
        estoqueBaixo: produtosEstoqueBaixo.status === 'fulfilled' ? produtosEstoqueBaixo.value : 0
      },
      clientes: {
        total: totalClientes.status === 'fulfilled' ? totalClientes.value : 0,
        novos: clientesNovos.status === 'fulfilled' ? clientesNovos.value : 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    
    // Retornar dados padrão em caso de erro
    return NextResponse.json({
      vendas: { hoje: 0, semana: 0, mes: 0 },
      pedidos: { total: 0, pendentes: 0, prontos: 0 },
      produtos: { total: 0, estoqueBaixo: 0 },
      clientes: { total: 0, novos: 0 }
    })
  }
}