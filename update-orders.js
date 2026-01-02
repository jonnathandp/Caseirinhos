import { prisma } from './src/lib/prisma'

async function updateOrdersWithDefaultPayment() {
  try {
    console.log('Iniciando atualização dos pedidos...')
    
    // Buscar todos os pedidos sem forma de pagamento
    const ordersWithoutPayment = await prisma.order.findMany({
      where: {
        OR: [
          { formaPagamento: null },
          { formaPagamento: '' },
          { formaPagamento: undefined }
        ]
      }
    })
    
    console.log(`Encontrados ${ordersWithoutPayment.length} pedidos sem forma de pagamento`)
    
    if (ordersWithoutPayment.length > 0) {
      // Atualizar todos com forma de pagamento padrão
      const updateResult = await prisma.order.updateMany({
        where: {
          id: {
            in: ordersWithoutPayment.map(order => order.id)
          }
        },
        data: {
          formaPagamento: 'Dinheiro'
        }
      })
      
      console.log(`Atualizados ${updateResult.count} pedidos com forma de pagamento padrão: "Dinheiro"`)
    } else {
      console.log('Todos os pedidos já possuem forma de pagamento definida')
    }
    
    // Verificar resultado
    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        clienteNome: true,
        formaPagamento: true,
        total: true,
        status: true
      }
    })
    
    console.log('Estado atual dos pedidos:')
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.clienteNome} - ${order.formaPagamento} - R$ ${order.total} - ${order.status}`)
    })
    
    console.log('Atualização concluída com sucesso!')
    
  } catch (error) {
    console.error('Erro ao atualizar pedidos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a função
updateOrdersWithDefaultPayment()