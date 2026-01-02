import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Schema Sync: Iniciando sincronização do schema...')
    
    // Verificar conexão
    await prisma.$connect()
    console.log('Schema Sync: Conectado ao banco')
    
    // Verificar se a coluna forma_pagamento existe
    const columnCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'forma_pagamento'
    `
    
    let operations = []
    
    if (Array.isArray(columnCheck) && columnCheck.length === 0) {
      console.log('Schema Sync: Adicionando coluna forma_pagamento...')
      
      await prisma.$executeRaw`
        ALTER TABLE orders 
        ADD COLUMN forma_pagamento VARCHAR(50) DEFAULT 'Dinheiro'
      `
      
      operations.push('Coluna forma_pagamento adicionada')
      console.log('Schema Sync: Coluna forma_pagamento adicionada')
    } else {
      operations.push('Coluna forma_pagamento já existe')
      console.log('Schema Sync: Coluna forma_pagamento já existe')
    }
    
    // Verificar outras colunas necessárias
    const allColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `
    
    console.log('Schema Sync: Colunas da tabela orders:', allColumns)
    
    // Atualizar pedidos existentes sem forma de pagamento
    const updateResult = await prisma.$executeRaw`
      UPDATE orders 
      SET forma_pagamento = 'Dinheiro' 
      WHERE forma_pagamento IS NULL 
      OR forma_pagamento = ''
    `
    
    operations.push(`${updateResult} pedidos atualizados com forma de pagamento padrão`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Schema sincronizado com sucesso',
      operations: operations,
      columns: allColumns,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Schema Sync: Erro:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao sincronizar schema',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}