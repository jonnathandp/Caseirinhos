import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar produtos com informações de estoque
    const stockData = await prisma.stock.findMany({
      include: {
        product: {
          select: {
            id: true,
            nome: true,
            categoria: true,
            ativo: true
          }
        }
      },
      where: {
        product: {
          ativo: true
        }
      },
      orderBy: {
        produtoNome: 'asc'
      }
    })

    // Transformar dados para o formato esperado pelo frontend
    const formattedStock = stockData.map(stock => ({
      id: stock.id,
      produtoId: stock.productId,
      produto: {
        nome: stock.product.nome,
        categoria: stock.product.categoria
      },
      quantidade: stock.quantidade,
      quantidadeMinima: stock.quantidadeMinima,
      unidade: stock.unidade,
      ultimaMovimentacao: stock.updatedAt.toISOString()
    }))

    return NextResponse.json(formattedStock)

  } catch (error) {
    console.error('Erro ao buscar estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { stockId, quantidade, motivo } = await request.json()

    if (!stockId || quantidade === undefined) {
      return NextResponse.json(
        { error: 'ID do estoque e quantidade são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar quantidade no estoque
    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: { 
        quantidade: Math.max(0, quantidade),
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            nome: true,
            categoria: true
          }
        }
      }
    })

    // TODO: Registrar movimento no histórico (futuro)
    console.log(`Estoque atualizado: ${updatedStock.product.nome} - ${quantidade} ${updatedStock.unidade}`)
    if (motivo) {
      console.log(`Motivo: ${motivo}`)
    }

    return NextResponse.json({
      success: true,
      stock: {
        id: updatedStock.id,
        produtoId: updatedStock.productId,
        produto: {
          nome: updatedStock.product.nome,
          categoria: updatedStock.product.categoria
        },
        quantidade: updatedStock.quantidade,
        quantidadeMinima: updatedStock.quantidadeMinima,
        unidade: updatedStock.unidade,
        ultimaMovimentacao: updatedStock.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { stockId, quantidadeMinima } = await request.json()

    if (!stockId || quantidadeMinima === undefined) {
      return NextResponse.json(
        { error: 'ID do estoque e quantidade mínima são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar quantidade mínima
    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: { 
        quantidadeMinima: Math.max(0, quantidadeMinima),
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            nome: true,
            categoria: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      stock: {
        id: updatedStock.id,
        produtoId: updatedStock.productId,
        produto: {
          nome: updatedStock.product.nome,
          categoria: updatedStock.product.categoria
        },
        quantidade: updatedStock.quantidade,
        quantidadeMinima: updatedStock.quantidadeMinima,
        unidade: updatedStock.unidade,
        ultimaMovimentacao: updatedStock.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar estoque mínimo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}