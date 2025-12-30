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

    // Por enquanto, usar dados consistentes com as páginas mockadas
    // até que o banco seja populado com dados reais
    const stats = {
      vendas: {
        hoje: 0,
        semana: 0,
        mes: 0
      },
      pedidos: {
        total: 0,
        pendentes: 0,
        prontos: 0
      },
      produtos: {
        total: 2, // Corresponde aos 2 produtos mockados na página de produtos
        estoqueBaixo: 1 // 1 produto com estoque baixo (Queijo Prato: 8 < 15)
      },
      clientes: {
        total: 2, // Corresponde aos 2 clientes mockados na página de clientes
        novos: 0
      }
    }

    // Tentar buscar dados reais do banco se disponível
    try {
      await prisma.user.findFirst()
      
      // Se chegou até aqui, o banco está funcionando
      // Buscar dados reais se existirem
      const [totalProdutos, totalClientes] = await Promise.allSettled([
        prisma.product.count({ where: { ativo: true } }),
        prisma.customer.count()
      ])

      // Usar dados reais se disponíveis, senão manter os mockados
      if (totalProdutos.status === 'fulfilled' && totalProdutos.value > 0) {
        stats.produtos.total = totalProdutos.value
      }
      
      if (totalClientes.status === 'fulfilled' && totalClientes.value > 0) {
        stats.clientes.total = totalClientes.value
      }
    } catch (dbError) {
      // Banco não disponível, manter dados mockados
      console.log('Usando dados mockados - banco não disponível')
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    
    // Retornar dados consistentes em caso de erro
    return NextResponse.json({
      vendas: { hoje: 0, semana: 0, mes: 0 },
      pedidos: { total: 0, pendentes: 0, prontos: 0 },
      produtos: { total: 2, estoqueBaixo: 1 },
      clientes: { total: 2, novos: 0 }
    })
  }
}