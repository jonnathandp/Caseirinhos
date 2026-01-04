import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const configData = await request.json()
    
    // Validar dados obrigatórios
    if (!configData.loja?.nome || !configData.loja?.email || !configData.usuario?.nome) {
      return NextResponse.json({ error: 'Dados obrigatórios não preenchidos' }, { status: 400 })
    }

    // Validar email
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(configData.loja.email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Atualizar nome do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { nome: configData.usuario.nome }
    })

    // Salvar configurações
    await prisma.configuration.upsert({
      where: { userId: user.id },
      update: {
        lojaNome: configData.loja.nome,
        lojaEndereco: configData.loja.endereco,
        lojaTelefone: configData.loja.telefone,
        lojaEmail: configData.loja.email,
        lojaCnpj: configData.loja.cnpj,
        notifEstoqueMin: configData.notificacoes.estoqueMinimo,
        notifNovosPedidos: configData.notificacoes.novosPedidos,
        notifEmailVendas: configData.notificacoes.emailVendas,
        tema: configData.sistema.tema,
        moeda: configData.sistema.moeda,
        fuso: configData.sistema.fuso
      },
      create: {
        userId: user.id,
        lojaNome: configData.loja.nome,
        lojaEndereco: configData.loja.endereco,
        lojaTelefone: configData.loja.telefone,
        lojaEmail: configData.loja.email,
        lojaCnpj: configData.loja.cnpj,
        notifEstoqueMin: configData.notificacoes.estoqueMinimo,
        notifNovosPedidos: configData.notificacoes.novosPedidos,
        notifEmailVendas: configData.notificacoes.emailVendas,
        tema: configData.sistema.tema,
        moeda: configData.sistema.moeda,
        fuso: configData.sistema.fuso
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso' 
    })
    
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e configurações
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { configuration: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Retornar configurações ou padrões
    const config = user.configuration
    const responseData = {
      loja: {
        nome: config?.lojaNome || 'Caseirinhos Delicious',
        endereco: config?.lojaEndereco || 'Rua das Delícias, 123',
        telefone: config?.lojaTelefone || '(11) 99999-9999',
        email: config?.lojaEmail || 'contato@caseirinhos.com',
        cnpj: config?.lojaCnpj || '12.345.678/0001-99'
      },
      usuario: {
        nome: user.nome,
        email: user.email,
        telefone: ''
      },
      notificacoes: {
        estoqueMinimo: config?.notifEstoqueMin ?? true,
        novosPedidos: config?.notifNovosPedidos ?? true,
        emailVendas: config?.notifEmailVendas ?? false
      },
      sistema: {
        tema: config?.tema || 'claro',
        moeda: config?.moeda || 'BRL',
        fuso: config?.fuso || 'America/Sao_Paulo'
      }
    }

    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}