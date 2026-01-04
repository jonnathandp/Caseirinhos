import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'temp-config.json')

// Dados padrão
const defaultConfig = {
  loja: {
    nome: 'Caseirinhos Delicious',
    endereco: 'Rua das Delícias, 123',
    telefone: '(11) 99999-9999',
    email: 'contato@caseirinhos.com',
    cnpj: '12.345.678/0001-99'
  },
  usuario: {
    nome: 'Usuário',
    email: 'usuario@exemplo.com',
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

async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return defaultConfig
  }
}

async function writeConfig(config: any) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  console.log('GET /api/configuracoes-temp - Início')
  try {
    const config = await readConfig()
    console.log('Configurações carregadas do arquivo')
    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao carregar configurações:', error)
    return NextResponse.json(defaultConfig)
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/configuracoes-temp - Início')
  try {
    const configData = await request.json()
    console.log('Dados recebidos:', configData)
    
    const success = await writeConfig(configData)
    
    if (success) {
      console.log('Configurações salvas com sucesso')
      return NextResponse.json({ 
        success: true, 
        message: 'Configurações salvas com sucesso' 
      })
    } else {
      throw new Error('Falha ao salvar arquivo')
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}