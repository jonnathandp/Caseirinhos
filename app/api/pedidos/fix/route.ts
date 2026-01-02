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
    
    // Buscar todos os pedidos
    const allOrders = await prisma.order.findMany()
    console.log(`API Fix: ${allOrders.length} pedidos encontrados`)
    
    if (allOrders.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum pedido encontrado',
        updated: 0 
      })
    }
    
    // Buscar pedidos sem forma de pagamento
    const ordersWithoutPayment = allOrders.filter(order => 
      !order.formaPagamento || order.formaPagamento === '' || order.formaPagamento === null
    )
    
    console.log(`API Fix: ${ordersWithoutPayment.length} pedidos precisam de correção`)
    
    let updatedCount = 0
    
    if (ordersWithoutPayment.length > 0) {
      // Atualizar todos com forma de pagamento padrão
      for (const order of ordersWithoutPayment) {
        await prisma.order.update({
          where: { id: order.id },
          data: { formaPagamento: 'Dinheiro' }
        })
        console.log(`API Fix: Pedido ${order.clienteNome} atualizado`)
        updatedCount++
      }
    }
    
    // Verificar resultado
    const updatedOrders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: { dataPedido: 'desc' }
    })
    
    console.log(`API Fix: Correção concluída. ${updatedCount} pedidos atualizados`)
    
    return NextResponse.json({
      message: 'Pedidos corrigidos com sucesso',
      totalOrders: updatedOrders.length,
      updated: updatedCount,
      orders: updatedOrders.map(order => ({
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
      { error: 'Erro ao corrigir pedidos', details: errorMessage },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}