import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { estoque: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { nome, preco, custo, categoria, descricao, imagem, estoque, ativo } = await request.json()

    // Atualizar o produto
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        nome,
        preco,
        custo: custo || 0,
        categoria,
        descricao,
        imagem,
        ativo
      }
    })

    // Atualizar ou criar o estoque se fornecido
    if (estoque) {
      await prisma.stock.upsert({
        where: { productId: params.id },
        update: {
          quantidade: estoque.quantidade || 0,
          quantidadeMinima: estoque.quantidadeMinima || 0,
          unidade: estoque.unidade || 'unidade'
        },
        create: {
          productId: params.id,
          produtoNome: nome,
          quantidade: estoque.quantidade || 0,
          quantidadeMinima: estoque.quantidadeMinima || 0,
          unidade: estoque.unidade || 'unidade'
        }
      })
    }

    // Buscar o produto atualizado com estoque
    const updatedProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: { estoque: true }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}