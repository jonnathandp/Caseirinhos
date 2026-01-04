import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
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

    // Aqui você salvaria no banco de dados
    // Por enquanto, vamos simular salvamento
    console.log('Configurações sendo salvas:', configData)
    
    // Em um sistema real, você salvaria no banco:
    // await prisma.configuracao.upsert({
    //   where: { userId: session.user.id },
    //   update: configData,
    //   create: { ...configData, userId: session.user.id }
    // })

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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Aqui você buscaria as configurações do banco de dados
    // Por enquanto, retornamos configurações padrão
    const defaultConfig = {
      loja: {
        nome: 'Caseirinhos Delicious',
        endereco: 'Rua das Delícias, 123',
        telefone: '(11) 99999-9999',
        email: 'contato@caseirinhos.com',
        cnpj: '12.345.678/0001-99'
      },
      usuario: {
        nome: session.user?.name || '',
        email: session.user?.email || '',
        telefone: ''
      },
      notificacoes: {
        estoqueMinimo: true,
        novosPedidos: true,
        emailVendas: false
      },
      sistema: {
        tema: 'claro',
        moeda: 'BRL',
        fuso: 'America/Sao_Paulo'
      }
    }

    return NextResponse.json(defaultConfig)
    
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}