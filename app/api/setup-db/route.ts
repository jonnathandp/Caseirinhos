import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('🗄️ Iniciando setup do banco...')

    // Gerar cliente Prisma
    console.log('📦 Gerando cliente Prisma...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    // Fazer push do schema
    console.log('🚀 Criando tabelas no banco...')
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' })

    // Popular com dados
    console.log('🌱 Populando banco com dados iniciais...')
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })

    console.log('✅ Banco configurado com sucesso!')

    return NextResponse.json({ 
      success: true, 
      message: 'Banco configurado com sucesso!' 
    })
  } catch (error: any) {
    console.error('❌ Erro ao configurar banco:', error)
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