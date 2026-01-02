import { PrismaClient, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@caseirinhos.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@caseirinhos.com',
      senha: hashedPassword,
      tipo: UserType.ADMIN,
      ativo: true,
    },
  })

  console.log('👤 Usuário admin criado:', adminUser.email)

  // Criar produtos de exemplo
  const produtos = [
    {
      nome: 'Bolo de Chocolate',
      categoria: 'Bolos',
      preco: 45.00,
      custo: 25.00,
      descricao: 'Delicioso bolo de chocolate com cobertura cremosa',
      imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
    },
    {
      nome: 'Brigadeiro Gourmet',
      categoria: 'Brigadeiros',
      preco: 3.50,
      custo: 1.20,
      descricao: 'Brigadeiro artesanal com chocolate belga',
      imagem: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'
    },
    {
      nome: 'Cupcake Red Velvet',
      categoria: 'Cupcakes',
      preco: 8.00,
      custo: 3.50,
      descricao: 'Cupcake red velvet com cream cheese',
      imagem: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400'
    },
    {
      nome: 'Torta de Limão',
      categoria: 'Tortas',
      preco: 35.00,
      custo: 18.00,
      descricao: 'Torta de limão com merengue',
      imagem: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    },
    {
      nome: 'Coxinha de Frango',
      categoria: 'Salgados',
      preco: 4.50,
      custo: 2.00,
      descricao: 'Coxinha tradicional de frango',
      imagem: 'https://images.unsplash.com/photo-1594998893017-36147c62e32b?w=400'
    },
    {
      nome: 'Pão de Açúcar',
      categoria: 'Doces',
      preco: 2.50,
      custo: 1.00,
      descricao: 'Doce tradicional brasileiro',
      imagem: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400'
    },
    {
      nome: 'Suco Natural',
      categoria: 'Bebidas',
      preco: 6.00,
      custo: 2.50,
      descricao: 'Suco natural de frutas da estação',
      imagem: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400'
    },
    {
      nome: 'Bolo de Cenoura',
      categoria: 'Bolos',
      preco: 40.00,
      custo: 22.00,
      descricao: 'Bolo de cenoura com cobertura de chocolate',
      imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400'
    }
  ]

  for (const produto of produtos) {
    const createdProduct = await prisma.product.create({
      data: produto,
    })

    // Criar estoque para cada produto
    await prisma.stock.create({
      data: {
        productId: createdProduct.id,
        produtoNome: createdProduct.nome,
        quantidade: Math.floor(Math.random() * 50) + 10, // 10-60 unidades
        quantidadeMinima: 5,
        unidade: 'unidade',
      },
    })

    console.log('🧁 Produto criado:', createdProduct.nome)
  }

  // Criar ingredientes de exemplo
  const ingredientes = [
    {
      nome: 'Farinha de Trigo',
      quantidade: 10.5,
      unidade: 'kg',
      custoUnitario: 4.50,
      fornecedor: 'Distribuidora ABC',
      dataValidade: new Date('2024-12-31')
    },
    {
      nome: 'Açúcar Cristal',
      quantidade: 8.0,
      unidade: 'kg',
      custoUnitario: 3.20,
      fornecedor: 'Distribuidora ABC',
      dataValidade: new Date('2025-06-30')
    },
    {
      nome: 'Chocolate em Pó',
      quantidade: 2.5,
      unidade: 'kg',
      custoUnitario: 12.00,
      fornecedor: 'Chocolates XYZ',
      dataValidade: new Date('2024-08-15')
    },
    {
      nome: 'Ovos',
      quantidade: 60,
      unidade: 'unidade',
      custoUnitario: 0.45,
      fornecedor: 'Granja Local',
      dataValidade: new Date('2024-02-15')
    },
    {
      nome: 'Leite Integral',
      quantidade: 5.0,
      unidade: 'litro',
      custoUnitario: 4.80,
      fornecedor: 'Laticínios Vale',
      dataValidade: new Date('2024-02-10')
    },
    {
      nome: 'Manteiga',
      quantidade: 3.0,
      unidade: 'kg',
      custoUnitario: 8.50,
      fornecedor: 'Laticínios Vale',
      dataValidade: new Date('2024-03-01')
    }
  ]

  for (const ingrediente of ingredientes) {
    const createdIngredient = await prisma.ingredient.create({
      data: ingrediente,
    })

    console.log('🥄 Ingrediente criado:', createdIngredient.nome)
  }

  // Criar clientes de exemplo
  const clientes = [
    {
      nome: 'Maria Silva',
      email: 'maria@email.com',
      telefone: '(11) 99999-1111',
      endereco: 'Rua das Flores, 123 - Centro',
      dataNascimento: new Date('1985-03-15'),
      pontosFidelidade: 150
    },
    {
      nome: 'João Santos',
      email: 'joao@email.com',
      telefone: '(11) 99999-2222',
      endereco: 'Av. Principal, 456 - Jardim América',
      dataNascimento: new Date('1990-07-22'),
      pontosFidelidade: 80
    },
    {
      nome: 'Ana Costa',
      email: 'ana@email.com',
      telefone: '(11) 99999-3333',
      endereco: 'Rua do Comércio, 789 - Vila Nova',
      dataNascimento: new Date('1988-12-03'),
      pontosFidelidade: 220
    },
    {
      nome: 'Carlos Oliveira',
      email: 'carlos@email.com',
      telefone: '(11) 99999-4444',
      endereco: 'Rua das Palmeiras, 321 - Bela Vista',
      dataNascimento: new Date('1992-05-18'),
      pontosFidelidade: 95
    },
    {
      nome: 'Fernanda Lima',
      email: 'fernanda@email.com',
      telefone: '(11) 99999-5555',
      endereco: 'Av. dos Anjos, 654 - Alto da Glória',
      dataNascimento: new Date('1987-11-30'),
      pontosFidelidade: 180
    }
  ]

  for (const cliente of clientes) {
    const createdCustomer = await prisma.customer.upsert({
      where: { email: cliente.email },
      update: {},
      create: cliente,
    })

    console.log('👤 Cliente criado:', createdCustomer.nome)
  }
  
  console.log('🔍 A - Antes do DEBUG')
  console.log('🔍 DEBUG: Loop de clientes concluído')
  console.log('🔍 B - Depois do DEBUG')

  // Criar pedidos e vendas de exemplo
  try {
    const allProducts = await prisma.product.findMany()
    const allCustomers = await prisma.customer.findMany()

    console.log(`📊 Produtos encontrados: ${allProducts.length}`)
    console.log(`👥 Clientes encontrados: ${allCustomers.length}`)

    if (allProducts.length > 0 && allCustomers.length > 0) {
      console.log('🔄 Criando pedidos e vendas...')
      // Criar pedidos dos últimos 7 dias
      for (let i = 0; i < 15; i++) {
      const dataVenda = new Date()
      dataVenda.setDate(dataVenda.getDate() - Math.floor(Math.random() * 7))
      
      const cliente = allCustomers[Math.floor(Math.random() * allCustomers.length)]
      const numProdutos = Math.floor(Math.random() * 3) + 1
      
      let totalPedido = 0
      const items = []
      
      for (let j = 0; j < numProdutos; j++) {
        const produto = allProducts[Math.floor(Math.random() * allProducts.length)]
        const quantidade = Math.floor(Math.random() * 3) + 1
        const subtotal = Number(produto.preco) * quantidade
        totalPedido += subtotal
        
        items.push({
          productId: produto.id,
          produtoNome: produto.nome,
          quantidade,
          precoUnitario: produto.preco,
          subtotal
        })
      }
      
      const order = await prisma.order.create({
        data: {
          clienteNome: cliente.nome,
          total: totalPedido,
          status: ['CONFIRMADO', 'ENTREGUE'][Math.floor(Math.random() * 2)] as any,
          tipoEntrega: ['retirada', 'entrega'][Math.floor(Math.random() * 2)],
          formaPagamento: ['Dinheiro', 'Cartão', 'Pix'][Math.floor(Math.random() * 3)],
          dataPedido: dataVenda,
          cliente: {
            connect: { id: cliente.id }
          },
          items: {
            create: items
          }
        }
      })
      
      // Criar registros de venda para cada item do pedido
      for (const item of items) {
        await prisma.sale.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            produtoNome: item.produtoNome,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal,
            dataVenda
          }
        })
      }
      
      console.log(`📦 Pedido criado: ${order.id} - ${cliente.nome} - R$ ${totalPedido.toFixed(2)}`)
    }
    }
  } catch (error) {
    console.error('❌ Erro ao criar pedidos:', error)
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })