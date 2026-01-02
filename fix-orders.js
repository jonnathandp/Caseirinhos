const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateOrdersWithDefaultPayment() {
  try {
    console.log('🔄 Iniciando atualização dos pedidos...')
    
    // Buscar todos os pedidos
    const allOrders = await prisma.order.findMany()
    console.log(`📊 Total de pedidos encontrados: ${allOrders.length}`)
    
    if (allOrders.length === 0) {
      console.log('❌ Nenhum pedido encontrado no banco de dados')
      return
    }
    
    // Buscar pedidos sem forma de pagamento
    const ordersWithoutPayment = allOrders.filter(order => 
      !order.formaPagamento || order.formaPagamento === '' || order.formaPagamento === null
    )
    
    console.log(`🔍 Pedidos sem forma de pagamento: ${ordersWithoutPayment.length}`)
    
    if (ordersWithoutPayment.length > 0) {
      // Atualizar todos com forma de pagamento padrão
      for (const order of ordersWithoutPayment) {
        await prisma.order.update({
          where: { id: order.id },
          data: { formaPagamento: 'Dinheiro' }
        })
        console.log(`✅ Pedido ${order.clienteNome} atualizado com forma de pagamento: Dinheiro`)
      }
      
      console.log(`🎉 ${ordersWithoutPayment.length} pedidos atualizados com sucesso!`)
    } else {
      console.log('✅ Todos os pedidos já possuem forma de pagamento definida')
    }
    
    // Verificar resultado final
    const updatedOrders = await prisma.order.findMany({
      select: {
        id: true,
        clienteNome: true,
        formaPagamento: true,
        total: true,
        status: true,
        dataPedido: true
      },
      orderBy: { dataPedido: 'desc' }
    })
    
    console.log('\n📋 Estado atual dos pedidos:')
    updatedOrders.forEach((order, index) => {
      const data = new Date(order.dataPedido).toLocaleDateString('pt-BR')
      console.log(`${index + 1}. ${order.clienteNome} | ${order.formaPagamento} | R$ ${order.total} | ${order.status} | ${data}`)
    })
    
    console.log('\n🚀 Atualização concluída! Os pedidos agora devem aparecer na interface.')
    
  } catch (error) {
    console.error('❌ Erro ao atualizar pedidos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a função
updateOrdersWithDefaultPayment()