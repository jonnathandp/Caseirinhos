import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Iniciando busca de pedidos...')
    
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '7' // dias

    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))
    
    const pedidos = await prisma.order.findMany({
      where: {
        dataPedido: {
          gte: dataInicio
        }
      },
      include: {
        cliente: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { dataPedido: 'desc' },
      take: 100
    })

    console.log(`API: ${pedidos.length} pedidos encontrados no banco`)
    
    if (pedidos.length > 0) {
      console.log('API: Primeiro pedido:', JSON.stringify({
        id: pedidos[0].id,
        clienteNome: pedidos[0].clienteNome,
        total: pedidos[0].total,
        formaPagamento: pedidos[0].formaPagamento,
        status: pedidos[0].status,
        itemsCount: pedidos[0].items?.length || 0
      }, null, 2))
    }

    // Adicionar numeração de 3 dígitos baseada na ordem de criação
    const pedidosComNumero = pedidos.reverse().map((pedido, index) => {
      const numeroFormatado = String(index + 1).padStart(3, '0')
      console.log(`API: Processando pedido ${pedido.id} -> número ${numeroFormatado}`)
      
      // Garantir que formaPagamento sempre tenha um valor
      const formaPagamentoSegura = pedido.formaPagamento || 'Dinheiro'
      
      return {
        ...pedido,
        numero: numeroFormatado,
        formaPagamento: formaPagamentoSegura
      }
    }).reverse()

    console.log(`API: Retornando ${pedidosComNumero.length} pedidos com numeração`)
    
    // Log adicional para debug
    if (pedidosComNumero.length > 0) {
      console.log('API: Exemplo do primeiro pedido processado:', {
        id: pedidosComNumero[0].id,
        numero: pedidosComNumero[0].numero,
        clienteNome: pedidosComNumero[0].clienteNome,
        formaPagamento: pedidosComNumero[0].formaPagamento
      })
    }
    
    return NextResponse.json(pedidosComNumero)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: 'Erro ao carregar pedidos' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    
    console.log(`API: Atualizando pedido ${id} para status ${status}`)
    
    const pedido = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        cliente: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log(`API: Pedido ${id} atualizado com sucesso`)
    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      clienteNome, 
      clienteTelefone,
      total, 
      tipoEntrega, 
      formaPagamento,
      endereco, 
      dataEntrega, 
      observacoes, 
      status,
      items 
    } = await request.json()

    console.log('API: Dados recebidos:', JSON.stringify({
      clienteNome,
      clienteTelefone,
      total,
      tipoEntrega,
      formaPagamento,
      endereco,
      dataEntrega,
      observacoes,
      status,
      itemsCount: items?.length || 0
    }, null, 2))

    // Validação básica
    if (!clienteNome) {
      console.error('API: Nome do cliente é obrigatório')
      return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 })
    }

    if (!total || total <= 0) {
      console.error('API: Total deve ser maior que zero')
      return NextResponse.json({ error: 'Total deve ser maior que zero' }, { status: 400 })
    }

    console.log('API: Criando novo pedido para cliente:', clienteNome)

    // Verificar conexão com banco
    try {
      await prisma.$connect()
      console.log('API: Conectado ao banco de dados')
    } catch (dbError) {
      console.error('API: Erro de conexão com banco:', dbError)
      return NextResponse.json({ 
        error: 'Erro de conexão com banco de dados',
        details: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Buscar ou criar cliente
    let cliente = null
    if (clienteTelefone) {
      try {
        cliente = await prisma.customer.findFirst({
          where: { telefone: clienteTelefone }
        })
        console.log('API: Cliente existente encontrado:', cliente?.id || 'não encontrado')
      } catch (error) {
        console.warn('API: Erro ao buscar cliente existente:', error)
      }
    }

    if (!cliente && clienteNome) {
      try {
        cliente = await prisma.customer.create({
          data: {
            nome: clienteNome,
            telefone: clienteTelefone || null,
            endereco: tipoEntrega === 'delivery' ? endereco : null
          }
        })
        console.log('API: Cliente criado:', cliente.id)
      } catch (error) {
        console.log('API: Erro ao criar cliente, continuando sem vincular:', error)
      }
    }

    // Contar total de pedidos para gerar número sequencial de 3 dígitos
    let totalPedidos = 0
    try {
      totalPedidos = await prisma.order.count()
      console.log('API: Total de pedidos existentes:', totalPedidos)
    } catch (error) {
      console.warn('API: Erro ao contar pedidos, usando 0:', error)
    }
    
    const numeroPedido = String(totalPedidos + 1).padStart(3, '0')
    console.log('API: Número do novo pedido:', numeroPedido)

    // Criar o pedido
    let pedido
    try {
      pedido = await prisma.order.create({
        data: {
          clienteId: cliente?.id || null,
          clienteNome,
          total: Number(total),
          status: status || 'PENDENTE',
          tipoEntrega: tipoEntrega || 'retirada',
          formaPagamento: formaPagamento || 'Dinheiro',
          endereco: endereco || null,
          dataEntrega: dataEntrega ? new Date(dataEntrega) : null,
          observacoes: observacoes || null
        }
      })
      console.log('API: Pedido criado:', pedido.id)
    } catch (error) {
      console.error('API: Erro ao criar pedido:', error)
      return NextResponse.json({ 
        error: 'Erro ao criar pedido',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Criar os itens do pedido
    if (items && items.length > 0) {
      try {
        console.log('API: Criando', items.length, 'itens do pedido')
        await Promise.all(items.map((item: any, index: number) => {
          console.log(`API: Item ${index + 1}:`, JSON.stringify({
            orderId: pedido.id,
            productId: item.productId,
            produtoNome: item.produtoNome,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal
          }, null, 2))
          
          return prisma.orderItem.create({
            data: {
              orderId: pedido.id,
              productId: item.productId || null,
              produtoNome: item.produtoNome,
              quantidade: Number(item.quantidade),
              precoUnitario: Number(item.precoUnitario),
              subtotal: Number(item.subtotal)
            }
          })
        }))
        console.log('API: Todos os itens criados com sucesso')
      } catch (error) {
        console.error('API: Erro ao criar itens:', error)
        // Não retornar erro aqui - o pedido principal foi criado
        console.log('API: Continuando sem alguns itens devido ao erro')
      }
    }

    // Buscar o pedido completo
    let pedidoCompleto
    try {
      pedidoCompleto = await prisma.order.findUnique({
        where: { id: pedido.id },
        include: {
          cliente: true,
          items: {
            include: {
              product: true
            }
          }
        }
      })
      console.log('API: Pedido completo carregado')
    } catch (error) {
      console.warn('API: Erro ao carregar pedido completo, retornando básico:', error)
      pedidoCompleto = pedido
    }

    // Adicionar número sequencial ao resultado
    const pedidoComNumero = {
      ...pedidoCompleto,
      numero: numeroPedido
    }

    console.log(`API: Pedido #${numeroPedido} (${pedido.id}) criado com sucesso`)
    return NextResponse.json(pedidoComNumero, { status: 201 })
  } catch (error) {
    console.error('API: Erro geral ao criar pedido:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ 
      error: 'Erro ao criar pedido', 
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.warn('API: Erro ao desconectar do banco:', error)
    }
  }
}