import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Vendas hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const vendasHoje = await prisma.sale.aggregate({
      where: {
        dataVenda: {
          gte: hoje,
          lt: amanha
        }
      },
      _sum: {
        subtotal: true
      }
    })

    // Vendas da semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const vendasSemana = await prisma.sale.aggregate({
      where: {
        dataVenda: {
          gte: inicioSemana
        }
      },
      _sum: {
        subtotal: true
      }
    })

    // Vendas do mês
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const vendasMes = await prisma.sale.aggregate({
      where: {
        dataVenda: {
          gte: inicioMes
        }
      },
      _sum: {
        subtotal: true
      }
    })

    // Pedidos
    const totalPedidos = await prisma.order.count()
    const pedidosPendentes = await prisma.order.count({
      where: { status: 'PENDENTE' }
    })
    const pedidosProntos = await prisma.order.count({
      where: { status: 'PRONTO' }
    })

    // Produtos
    const totalProdutos = await prisma.product.count({
      where: { ativo: true }
    })
    
    const produtosEstoqueBaixo = await prisma.stock.count({
      where: {
        quantidade: {
          lte: prisma.stock.fields.quantidadeMinima
        }
      }
    })

    // Clientes
    const totalClientes = await prisma.customer.count()
    const clientesNovos = await prisma.customer.count({
      where: {
        createdAt: {
          gte: inicioMes
        }
      }
    })

    const stats = {
      vendas: {
        hoje: vendasHoje._sum.subtotal?.toNumber() || 0,
        semana: vendasSemana._sum.subtotal?.toNumber() || 0,
        mes: vendasMes._sum.subtotal?.toNumber() || 0
      },
      pedidos: {
        total: totalPedidos,
        pendentes: pedidosPendentes,
        prontos: pedidosProntos
      },
      produtos: {
        total: totalProdutos,
        estoqueBaixo: produtosEstoqueBaixo
      },
      clientes: {
        total: totalClientes,
        novos: clientesNovos
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}