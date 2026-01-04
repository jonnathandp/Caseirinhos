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

    // Datas para cálculos
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    // Buscar dados reais do banco
    const [
      totalProdutos,
      produtosEstoqueBaixo,
      totalClientes,
      clientesNovos,
      vendasHoje,
      vendasSemana,
      vendasMes,
      pedidosTotal,
      pedidosPendentes,
      pedidosProntos
    ] = await Promise.allSettled([
      // Produtos
      prisma.product.count({ where: { ativo: true } }),
      
      // Produtos com estoque baixo - usar query SQL direta
      prisma.$queryRaw`SELECT COUNT(*) as count FROM stock WHERE quantidade <= quantidade_minima`.then(
        (result: any[]) => result[0]?.count || 0
      ),
      
      // Clientes
      prisma.customer.count(),
      
      // Clientes novos este mês
      prisma.customer.count({
        where: {
          createdAt: {
            gte: inicioMes
          }
        }
      }),
      
      // Vendas hoje - somar os totais dos pedidos
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          createdAt: {
            gte: hoje
          }
        }
      }),
      
      // Vendas esta semana
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          createdAt: {
            gte: inicioSemana
          }
        }
      }),
      
      // Vendas este mês
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          createdAt: {
            gte: inicioMes
          }
        }
      }),
      
      // Pedidos total
      prisma.order.count(),
      
      // Pedidos pendentes
      prisma.order.count({
        where: {
          status: 'PENDENTE'
        }
      }),
      
      // Pedidos prontos
      prisma.order.count({
        where: {
          status: 'PRONTO'
        }
      })
    ])

    const stats = {
      vendas: {
        hoje: vendasHoje.status === 'fulfilled' ? (vendasHoje.value._sum.total || 0) : 0,
        semana: vendasSemana.status === 'fulfilled' ? (vendasSemana.value._sum.total || 0) : 0,
        mes: vendasMes.status === 'fulfilled' ? (vendasMes.value._sum.total || 0) : 0
      },
      pedidos: {
        total: pedidosTotal.status === 'fulfilled' ? pedidosTotal.value : 0,
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
    
    // Retornar dados zerados em caso de erro
    return NextResponse.json({
      vendas: { hoje: 0, semana: 0, mes: 0 },
      pedidos: { total: 0, pendentes: 0, prontos: 0 },
      produtos: { total: 0, estoqueBaixo: 0 },
      clientes: { total: 0, novos: 0 }
    })
  }
}