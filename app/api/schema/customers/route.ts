import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Customer Schema Sync: Iniciando sincronização...')
    
    // Verificar conexão
    await prisma.$connect()
    console.log('Customer Schema Sync: Conectado ao banco')
    
    // Verificar se a coluna observacoes existe na tabela customers
    const columnCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      AND column_name = 'observacoes'
    `
    
    let operations = []
    
    if (Array.isArray(columnCheck) && columnCheck.length === 0) {
      console.log('Customer Schema Sync: Adicionando coluna observacoes...')
      
      await prisma.$executeRaw`
        ALTER TABLE customers 
        ADD COLUMN observacoes TEXT
      `
      
      operations.push('Coluna observacoes adicionada à tabela customers')
      console.log('Customer Schema Sync: Coluna observacoes adicionada')
    } else {
      operations.push('Coluna observacoes já existe na tabela customers')
      console.log('Customer Schema Sync: Coluna observacoes já existe')
    }
    
    // Verificar outras colunas necessárias da tabela customers
    const allColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'customers'
      ORDER BY ordinal_position
    `
    
    console.log('Customer Schema Sync: Colunas da tabela customers:', allColumns)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Schema de clientes sincronizado com sucesso',
      operations: operations,
      columns: allColumns,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Customer Schema Sync: Erro:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao sincronizar schema de clientes',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}