import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  const products = await prisma.product.findMany()
  const customers = await prisma.customer.findMany()
  
  console.log(`Produtos: ${products.length}`)
  console.log(`Clientes: ${customers.length}`)
  
  if (products.length > 0 && customers.length > 0) {
    console.log('Condição atendida!')
    
    // Criar um pedido de teste
    const cliente = customers[0]
    const produto = products[0]
    
    const order = await prisma.order.create({
      data: {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        total: produto.preco * 2,
        status: 'CONFIRMADO',
        tipoEntrega: 'retirada',
        formaPagamento: 'Dinheiro',
        items: {
          create: [{
            productId: produto.id,
            produtoNome: produto.nome,
            quantidade: 2,
            precoUnitario: produto.preco,
            subtotal: produto.preco * 2
          }]
        }
      }
    })
    
    console.log('Pedido criado:', order.id)
    
    // Criar venda
    await prisma.sale.create({
      data: {
        orderId: order.id,
        productId: produto.id,
        produtoNome: produto.nome,
        quantidade: 2,
        precoUnitario: produto.preco,
        subtotal: produto.preco * 2,
        dataVenda: new Date()
      }
    })
    
    console.log('Venda criada!')
  } else {
    console.log('Condição NÃO atendida')
  }
}

test().then(() => prisma.$disconnect())
