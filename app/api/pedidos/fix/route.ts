import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('API Fix: Iniciando correção dos pedidos...')
    
    // Verificar conexão com banco
    try {
      await prisma.$connect()
      console.log('API Fix: Conexão com banco estabelecida')
    } catch (dbError) {
      console.error('API Fix: Erro de conexão com banco:', dbError)
      return NextResponse.json({
        error: 'Erro de conexão com banco de dados',
        details: dbError instanceof Error ? dbError.message : 'Conexão falhou'
      }, { status: 500 })
    }
    
    // Tentar buscar pedidos sem a coluna formaPagamento primeiro
    let allOrders: any[] = []
    try {
      console.log('API Fix: Tentando buscar pedidos...')
      allOrders = await prisma.order.findMany({
        select: {
          id: true,
          clienteNome: true,
          total: true,
          status: true,
          tipoEntrega: true,
          endereco: true,
          dataPedido: true,
          dataEntrega: true,
          observacoes: true,
          createdAt: true,
          updatedAt: true
        }
      })
      console.log(`API Fix: ${allOrders.length} pedidos encontrados`)
    } catch (selectError) {
      console.error('API Fix: Erro ao buscar pedidos:', selectError)
      
      // Se der erro, pode ser porque a coluna forma_pagamento não existe
      if (selectError instanceof Error && selectError.message.includes('forma_pagamento')) {
        return NextResponse.json({
          error: 'Coluna forma_pagamento não existe no banco',
          message: 'O banco de dados precisa ser atualizado com a nova estrutura',
          solution: 'Execute: npx prisma db push para sincronizar o schema',
          details: selectError.message
        }, { status: 500 })
      }
      
      throw selectError
    }
    
    if (allOrders.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum pedido encontrado',
        updated: 0 
      })
    }

    // Tentar adicionar a coluna formaPagamento se não existir
    try {
      console.log('API Fix: Verificando se coluna forma_pagamento existe...')
      
      // Tentar uma query raw para verificar se a coluna existe
      const columnCheck = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'forma_pagamento'
      `
      
      console.log('API Fix: Resultado da verificação de coluna:', columnCheck)
      
      if (Array.isArray(columnCheck) && columnCheck.length === 0) {
        console.log('API Fix: Coluna forma_pagamento não existe, adicionando...')
        
        // Adicionar a coluna se não existir
        await prisma.$executeRaw`
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) DEFAULT 'Dinheiro'
        `
        
        console.log('API Fix: Coluna forma_pagamento adicionada')
      } else {
        console.log('API Fix: Coluna forma_pagamento já existe')
      }
      
    } catch (columnError) {
      console.warn('API Fix: Erro ao verificar/adicionar coluna:', columnError)
      // Continuar mesmo com erro na coluna
    }

    // Agora tentar buscar e atualizar pedidos com formaPagamento
    let updatedCount = 0
    try {
      // Buscar pedidos completos incluindo formaPagamento
      const ordersComplete = await prisma.order.findMany()
      console.log(`API Fix: ${ordersComplete.length} pedidos carregados com sucesso`)
      
      // Buscar pedidos sem forma de pagamento
      const ordersWithoutPayment = ordersComplete.filter(order => 
        !order.formaPagamento || order.formaPagamento === '' || order.formaPagamento === null
      )
      
      console.log(`API Fix: ${ordersWithoutPayment.length} pedidos precisam de correção`)
      
      if (ordersWithoutPayment.length > 0) {
        // Atualizar todos com forma de pagamento padrão
        for (const order of ordersWithoutPayment) {
          try {
            await prisma.order.update({
              where: { id: order.id },
              data: { formaPagamento: 'Dinheiro' }
            })
            console.log(`API Fix: Pedido ${order.clienteNome} atualizado`)
            updatedCount++
          } catch (updateError) {
            console.warn(`API Fix: Erro ao atualizar pedido ${order.id}:`, updateError)
            // Continuar com outros pedidos
          }
        }
      }
      
    } catch (finalError) {
      console.error('API Fix: Erro na atualização final:', finalError)
      
      // Se ainda der erro, retornar informações sobre o que conseguimos fazer
      return NextResponse.json({
        error: 'Erro parcial na correção',
        message: 'Conseguimos encontrar os pedidos mas houve problema na atualização',
        totalFound: allOrders.length,
        updated: updatedCount,
        details: finalError instanceof Error ? finalError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Verificar resultado final
    const finalOrders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: { dataPedido: 'desc' }
    })

    console.log(`API Fix: Correção concluída. ${updatedCount} pedidos atualizados`)

    return NextResponse.json({
      message: 'Pedidos corrigidos com sucesso',
      totalOrders: finalOrders.length,
      updated: updatedCount,
      orders: finalOrders.slice(0, 5).map(order => ({
        id: order.id,
        clienteNome: order.clienteNome,
        formaPagamento: order.formaPagamento,
        total: order.total,
        itemsCount: order.items?.length || 0
      }))
    })
    
  } catch (error) {
    console.error('API Fix: Erro ao corrigir pedidos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { 
        error: 'Erro ao corrigir pedidos', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}