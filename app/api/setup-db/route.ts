import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Iniciando setup do banco...')

    // Verificar se ja existem dados
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()

    if (userCount > 0 && productCount > 0) {
      console.log('Banco ja populado: ' + userCount + ' usuarios, ' + productCount + ' produtos')
      return NextResponse.json({ 
        success: true, 
        message: 'Banco ja configurado! ' + userCount + ' usuarios e ' + productCount + ' produtos encontrados.' 
      })
    }

    // Se nao tem dados, executar seed
    const bcrypt = await import('bcryptjs')
    
    // Criar usuario admin se nao existir
    if (userCount === 0) {
      await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@caseirinhos.com',
          senha: await bcrypt.hash('admin123', 10),
          tipo: 'ADMIN'
        }
      })
      console.log('Usuario admin criado')
    }

    // Criar produtos de exemplo se nao existirem
    if (productCount === 0) {
      const produtos = [
        { nome: 'Bolo de Chocolate', categoria: 'Bolos', preco: 45, custo: 25, descricao: 'Delicioso bolo de chocolate', quantidade: 35 },
        { nome: 'Brigadeiro Gourmet', categoria: 'Brigadeiros', preco: 3.5, custo: 1.2, descricao: 'Brigadeiro artesanal', quantidade: 120 },
        { nome: 'Cupcake Red Velvet', categoria: 'Cupcakes', preco: 8, custo: 3.5, descricao: 'Cupcake red velvet', quantidade: 49 },
        { nome: 'Torta de Limao', categoria: 'Tortas', preco: 35, custo: 18, descricao: 'Torta de limao com merengue', quantidade: 37 },
        { nome: 'Coxinha de Frango', categoria: 'Salgados', preco: 4.5, custo: 2, descricao: 'Coxinha tradicional', quantidade: 14 },
        { nome: 'Pao de Acucar', categoria: 'Doces', preco: 2.5, custo: 1, descricao: 'Doce tradicional brasileiro', quantidade: 80 },
        { nome: 'Suco Natural', categoria: 'Bebidas', preco: 6, custo: 2.5, descricao: 'Suco natural de frutas', quantidade: 25 },
        { nome: 'Bolo de Cenoura', categoria: 'Bolos', preco: 40, custo: 22, descricao: 'Bolo de cenoura com cobertura', quantidade: 52 }
      ]

      for (const produto of produtos) {
        const createdProduct = await prisma.product.create({
          data: {
            nome: produto.nome,
            categoria: produto.categoria,
            preco: produto.preco.toString(),
            custo: produto.custo.toString(),
            descricao: produto.descricao,
            ativo: true
          }
        })

        await prisma.stock.create({
          data: {
            productId: createdProduct.id,
            produtoNome: createdProduct.nome,
            quantidade: produto.quantidade,
            quantidadeMinima: 5,
            unidade: 'unidade'
          }
        })
      }
      console.log(produtos.length + ' produtos criados')
    }

    console.log('Setup concluido com sucesso!')
    return NextResponse.json({ 
      success: true, 
      message: 'Banco configurado com sucesso! Usuario admin criado e produtos adicionados.' 
    })
  } catch (error: any) {
    console.error('Erro ao configurar banco:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao configurar banco: ' + error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para configurar o banco de dados'
  })
}
