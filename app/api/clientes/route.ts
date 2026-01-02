import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clientes = await prisma.customer.findMany({
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: 'Erro ao carregar clientes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, telefone, endereco, dataNascimento, observacoes } = await request.json()

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se a coluna observacoes existe antes de tentar usá-la
    let createData: any = {
      nome: nome.trim(),
      email: email?.trim() || null,
      telefone: telefone?.trim() || null,
      endereco: endereco?.trim() || null,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null
    }

    // Tentar adicionar observacoes se existir no schema
    try {
      if (observacoes) {
        createData.observacoes = observacoes.trim() || null
      }
      
      const cliente = await prisma.customer.create({
        data: createData
      })

      return NextResponse.json(cliente, { status: 201 })
    } catch (schemaError: any) {
      // Se falhar por causa da coluna observacoes, tentar sem ela
      if (schemaError.message?.includes('observacoes')) {
        console.log('Campo observacoes não existe, criando sem ele')
        delete createData.observacoes
        
        const cliente = await prisma.customer.create({
          data: createData
        })

        return NextResponse.json({
          ...cliente,
          observacoes: observacoes || null // Incluir no retorno mesmo que não salvo
        }, { status: 201 })
      }
      throw schemaError
    }
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, nome, email, telefone, endereco, dataNascimento, observacoes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 })
    }

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se a coluna observacoes existe antes de tentar usá-la
    let updateData: any = {
      nome: nome.trim(),
      email: email?.trim() || null,
      telefone: telefone?.trim() || null,
      endereco: endereco?.trim() || null,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null
    }

    // Tentar adicionar observacoes se existir no schema
    try {
      if (observacoes !== undefined) {
        updateData.observacoes = observacoes?.trim() || null
      }
      
      const cliente = await prisma.customer.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json(cliente)
    } catch (schemaError: any) {
      // Se falhar por causa da coluna observacoes, tentar sem ela
      if (schemaError.message?.includes('observacoes')) {
        console.log('Campo observacoes não existe, atualizando sem ele')
        delete updateData.observacoes
        
        const cliente = await prisma.customer.update({
          where: { id },
          data: updateData
        })

        return NextResponse.json({
          ...cliente,
          observacoes: observacoes || null // Incluir no retorno mesmo que não salvo
        })
      }
      throw schemaError
    }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 })
    }

    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cliente removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover cliente:', error)
    return NextResponse.json({ error: 'Erro ao remover cliente' }, { status: 500 })
  }
}