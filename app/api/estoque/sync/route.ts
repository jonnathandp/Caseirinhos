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

    console.log('Iniciando sincronização de produtos com estoque...')

    // Buscar produtos ativos que não têm entrada na tabela de estoque
    const productsWithoutStock = await prisma.product.findMany({
      where: {
        ativo: true,
        estoque: null
      }
    })

    console.log(`Encontrados ${productsWithoutStock.length} produtos sem estoque`)

    // Criar entradas de estoque para produtos que não têm
    const stockEntries = productsWithoutStock.map(product => ({
      productId: product.id,
      produtoNome: product.nome,
      quantidade: 0,
      quantidadeMinima: 5,
      unidade: 'unidade'
    }))

    if (stockEntries.length > 0) {
      await prisma.stock.createMany({
        data: stockEntries
      })
      console.log(`${stockEntries.length} entradas de estoque criadas`)
    }

    return NextResponse.json({
      success: true,
      message: `${stockEntries.length} produtos sincronizados com estoque`,
      syncedProducts: stockEntries.length
    })

  } catch (error) {
    console.error('Erro ao sincronizar estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}