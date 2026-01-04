import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  console.log('POST /api/configuracoes - Início')
  try {
    const session = await getServerSession()
    console.log('Session:', session)
    
    // Temporário: aceitar sem autenticação para debug
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    const configData = await request.json()
    console.log('Config data recebido:', configData)
    
    // Validar dados obrigatórios
    if (!configData.loja?.nome || !configData.loja?.email || !configData.usuario?.nome) {
      console.log('Dados obrigatórios ausentes')
      return NextResponse.json({ error: 'Dados obrigatórios não preenchidos' }, { status: 400 })
    }

    // Validar email
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(configData.loja.email)) {
      console.log('Email inválido:', configData.loja.email)
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Para debug, usar um ID de usuário fixo
    let userId = 'user_default_id'
    
    // Se tem sessão, buscar usuário real
    if (session?.user?.email) {
      console.log('Buscando usuário por email:', session.user.email)
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (user) {
        userId = user.id
        console.log('Usuário encontrado:', user.id)
        
        // Atualizar nome do usuário
        await prisma.user.update({
          where: { id: user.id },
          data: { nome: configData.usuario.nome }
        })
        console.log('Nome do usuário atualizado')
      }
    }

    // Salvar configurações
    console.log('Salvando configurações para userId:', userId)
    const result = await prisma.configuration.upsert({
      where: { userId: userId },
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
        userId: userId,
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
    
    console.log('Configurações salvas com sucesso:', result.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso' 
    })
    
  } catch (error) {
    console.error('ERRO ao salvar configurações:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('GET /api/configuracoes - Início')
  try {
    const session = await getServerSession()
    console.log('Session GET:', session)
    
    let userId = 'user_default_id'
    let user = null

    // Se tem sessão, buscar usuário real
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { configuration: true }
      })
      if (user) {
        userId = user.id
        console.log('Usuário encontrado:', user.id)
      }
    }

    // Buscar configurações
    const config = user?.configuration || await prisma.configuration.findUnique({
      where: { userId }
    })

    console.log('Configurações encontradas:', config ? 'SIM' : 'NÃO')

    // Retornar configurações ou padrões
    const responseData = {
      loja: {
        nome: config?.lojaNome || 'Caseirinhos Delicious',
        endereco: config?.lojaEndereco || 'Rua das Delícias, 123',
        telefone: config?.lojaTelefone || '(11) 99999-9999',
        email: config?.lojaEmail || 'contato@caseirinhos.com',
        cnpj: config?.lojaCnpj || '12.345.678/0001-99'
      },
      usuario: {
        nome: user?.nome || session?.user?.name || 'Usuário',
        email: user?.email || session?.user?.email || 'usuario@exemplo.com',
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

    console.log('Response data:', responseData)
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('ERRO ao buscar configurações:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}