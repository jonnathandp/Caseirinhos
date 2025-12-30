import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      include: {
        estoque: true
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao carregar produtos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const product = await prisma.product.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        preco: parseFloat(data.preco),
        custo: parseFloat(data.custo || 0),
        descricao: data.descricao,
        imagem: data.imagem,
        ativo: true
      }
    })

    // Criar estoque inicial
    await prisma.stock.create({
      data: {
        productId: product.id,
        produtoNome: product.nome,
        quantidade: parseInt(data.quantidadeInicial || 0),
        quantidadeMinima: parseInt(data.quantidadeMinima || 5),
        unidade: data.unidade || 'unidade'
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}