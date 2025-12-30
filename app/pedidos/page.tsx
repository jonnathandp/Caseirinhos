'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { 
  ShoppingCart, 
  Calendar, 
  Package2, 
  MapPin, 
  Search, 
  Filter 
} from 'lucide-react'

interface Order {
  id: string
  cliente: {
    nome: string
    telefone?: string
    endereco?: string
  }
  itens: Array<{
    produto: string
    quantidade: number
    preco: number
  }>
  total: number
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO'
  dataEntrega: string
  observacoes?: string
  createdAt: string
}

export default function PedidosPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<Order['status'] | 'TODOS'>('TODOS')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      loadOrders()
    }
  }, [session])

  const loadOrders = async () => {
    try {
      console.log('Carregando pedidos da API...')
      const response = await fetch('/api/pedidos')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos')
      }
      
      const ordersData = await response.json()
      console.log('Pedidos carregados:', ordersData.length)
      
      // Mapear dados do banco para o formato da interface
      const mappedOrders = ordersData.map((order: any) => ({
        id: order.id,
        cliente: {
          nome: order.cliente?.nome || 'Cliente não informado',
          telefone: order.cliente?.telefone || '',
          endereco: order.cliente?.endereco || ''
        },
        itens: order.items?.map((item: any) => ({
          produto: item.product?.nome || 'Produto',
          quantidade: item.quantidade || 1,
          preco: Number(item.preco) || 0
        })) || [],
        total: Number(order.total) || 0,
        status: order.status || 'PENDENTE',
        dataEntrega: order.dataEntrega || order.dataPedido,
        observacoes: order.observacoes || '',
        createdAt: order.dataPedido || order.createdAt
      }))
      
      setOrders(mappedOrders)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      // Manter alguns dados de exemplo se a API falhar
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      console.log(`Atualizando status do pedido ${orderId} para ${newStatus}`)
      
      // Atualizar no estado local primeiro para resposta imediata
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      
      // Enviar para a API
      const response = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: orderId, status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar status no servidor')
      }
      
      console.log('Status atualizado com sucesso no banco')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      
      // Reverter mudança local se houver erro
      const originalOrder = orders.find(order => order.id === orderId)
      if (originalOrder) {
        setOrders(orders.map(order =>
          order.id === orderId ? originalOrder : order
        ))
      }
      
      alert('Erro ao atualizar status do pedido. Tente novamente.')
    }
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      PREPARANDO: 'bg-blue-100 text-blue-800',
      PRONTO: 'bg-green-100 text-green-800',
      ENTREGUE: 'bg-gray-100 text-gray-800',
      CANCELADO: 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  const getOrderStatusText = (status: Order['status']) => {
    const texts = {
      PENDENTE: 'Pendente',
      PREPARANDO: 'Preparando',
      PRONTO: 'Pronto',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado'
    }
    return texts[status]
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.includes(searchTerm)
    const matchesFilter = filter === 'TODOS' || order.status === filter
    return matchesSearch && matchesFilter
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <ShoppingCart className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
                <p className="text-gray-600">Gerencie todos os pedidos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Order['status'] | 'TODOS')}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="TODOS">Todos os status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PREPARANDO">Preparando</option>
                  <option value="PRONTO">Pronto</option>
                  <option value="ENTREGUE">Entregue</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'TODOS' 
                  ? 'Nenhum pedido encontrado'
                  : 'Nenhum pedido ainda'
                }
              </h3>
              <p className="text-gray-600">
                {filter === 'TODOS' 
                  ? 'Ainda não há pedidos cadastrados no sistema'
                  : `Não há pedidos com status ${getOrderStatusText(filter)}`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">{order.cliente.nome}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Entrega: {new Date(order.dataEntrega).toLocaleDateString()}
                          </div>
                          {order.cliente.telefone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Package2 className="h-4 w-4 mr-2 text-gray-400" />
                              {order.cliente.telefone}
                            </div>
                          )}
                          {order.cliente.endereco && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {order.cliente.endereco}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Itens do pedido:</h4>
                          <div className="space-y-1">
                            {order.itens.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {item.quantidade}x {item.produto} - R$ {item.preco.toFixed(2)}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-lg font-bold text-primary-600">
                              Total: R$ {order.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.observacoes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {order.observacoes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="flex flex-col gap-2">
                        {order.status === 'PENDENTE' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PREPARANDO')}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Iniciar Preparação
                          </button>
                        )}
                        {order.status === 'PREPARANDO' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PRONTO')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            Marcar como Pronto
                          </button>
                        )}
                        {order.status === 'PRONTO' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ENTREGUE')}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                          >
                            Marcar como Entregue
                          </button>
                        )}
                        {['PENDENTE', 'PREPARANDO'].includes(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CANCELADO')}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                          >
                            Cancelar Pedido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
