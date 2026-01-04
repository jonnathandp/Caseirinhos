'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { 
  ShoppingCart, 
  Calendar, 
  Package2, 
  MapPin, 
  Search, 
  Filter,
  Phone,
  Clock,
  DollarSign,
  Truck,
  Store,
  CreditCard,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'

interface Order {
  id: string
  numero?: number
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
  formaPagamento?: string
  tipoEntrega?: string
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
  const [selectedPeriod, setSelectedPeriod] = useState('7')
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  const loadOrders = useCallback(async () => {
    try {
      console.log('Carregando pedidos da API...')
      const response = await fetch(`/api/pedidos?periodo=${selectedPeriod}`)
      
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status, response.statusText)
        throw new Error('Erro ao buscar pedidos')
      }
      
      const ordersData = await response.json()
      console.log('Pedidos carregados:', ordersData.length)
      console.log('Dados dos pedidos:', ordersData)
      
      if (!Array.isArray(ordersData)) {
        console.error('Dados dos pedidos não é um array:', ordersData)
        setOrders([])
        return
      }
      
      // Mapear dados da API para a interface Order
      const mappedOrders = ordersData.map((order: any) => {
        try {
          return {
            id: order.id,
            numero: order.numero || null,
            cliente: {
              nome: order.clienteNome || order.cliente?.nome || 'Cliente não identificado',
              telefone: order.cliente?.telefone || null,
              endereco: order.endereco || order.cliente?.endereco || null
            },
            itens: order.items?.map((item: any) => ({
              produto: item.produtoNome || item.product?.nome || 'Produto não identificado',
              quantidade: item.quantidade || 0,
              preco: parseFloat(item.precoUnitario || item.preco || 0)
            })) || [],
            total: parseFloat(order.total || 0),
            formaPagamento: order.formaPagamento || 'Não informado',
            tipoEntrega: order.tipoEntrega || 'retirada',
            status: order.status || 'PENDENTE',
            dataEntrega: order.dataEntrega || order.dataPedido || new Date().toISOString(),
            observacoes: order.observacoes || null,
            createdAt: order.dataPedido || order.createdAt || new Date().toISOString()
          }
        } catch (itemError) {
          console.error('Erro ao mapear pedido:', itemError, order)
          return null
        }
      }).filter(Boolean) // Remove itens null

      setOrders(mappedOrders)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    if (session) {
      loadOrders()
    }
  }, [session, loadOrders])

  const handleCreateSampleOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seed-vendas', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}`)
        loadOrders()
      } else {
        alert('❌ Erro ao criar pedidos de exemplo')
      }
    } catch (error) {
      console.error('Erro ao criar pedidos:', error)
      alert('❌ Erro ao conectar com o servidor')
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
      <div className="min-h-screen bg-gray-50">
        {/* Header Mobile-First */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <ShoppingCart className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
                  <p className="text-sm text-gray-600">{filteredOrders.length} pedidos</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <a
                  href="/loja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Store className="h-4 w-4" />
                  <span className="hidden sm:inline">Loja</span>
                </a>
                <button
                  onClick={loadOrders}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              {/* Primeira linha: Busca e Filtro de Período */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Filtro de Período */}
                <div className="flex items-center gap-3 sm:min-w-[200px]">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[160px]"
                  >
                    <option value="3">Últimos 3 dias</option>
                    <option value="7">Últimos 7 dias</option>
                    <option value="15">Últimos 15 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último ano</option>
                  </select>
                </div>
              </div>
              
              {/* Segunda linha: Filtros de Status */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['TODOS', 'PENDENTE', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as Order['status'] | 'TODOS')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'TODOS' ? 'Todos' : getOrderStatusText(status as Order['status'])}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando pedidos...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'TODOS' 
                  ? 'Nenhum pedido encontrado'
                  : 'Nenhum pedido ainda'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'TODOS' 
                  ? 'Ainda não há pedidos cadastrados no sistema'
                  : `Não há pedidos com status ${getOrderStatusText(filter)}`
                }
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={loadOrders}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recarregar
                </button>
                {filter === 'TODOS' && (
                  <button
                    onClick={handleCreateSampleOrders}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    📦 Criar Pedidos de Exemplo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id)
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Header do Card */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <span className="text-primary-600 font-bold text-sm">
                                #{order.numero || String(orders.indexOf(order) + 1).padStart(3, '0')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {order.cliente?.nome || 'Cliente não identificado'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 'Data não disponível'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Resumo rápido */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-lg font-bold text-green-600">
                            R$ {Number(order.total).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-600 truncate">
                            {order.formaPagamento || 'Não informado'}
                          </span>
                        </div>
                      </div>

                      {/* Botão para expandir */}
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            <span className="text-sm font-medium">Ocultar detalhes</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-medium">Ver detalhes</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        <div className="p-4 space-y-4">
                          {/* Informações do cliente */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <Package2 className="h-4 w-4 mr-2" />
                              Informações do Cliente
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {order.cliente?.telefone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                                  <span className="text-sm text-gray-600">{order.cliente.telefone}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                {order.tipoEntrega === 'delivery' ? (
                                  <Truck className="h-4 w-4 text-gray-400 mr-3" />
                                ) : (
                                  <Store className="h-4 w-4 text-gray-400 mr-3" />
                                )}
                                <span className="text-sm text-gray-600">
                                  {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retirada'}
                                </span>
                              </div>
                              {order.cliente?.endereco && (
                                <div className="flex items-start">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{order.cliente.endereco}</span>
                                </div>
                              )}
                              {order.dataEntrega && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                                  <span className="text-sm text-gray-600">
                                    Entrega: {order.dataEntrega ? new Date(order.dataEntrega).toLocaleDateString('pt-BR') : 'Não informado'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Itens do pedido */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Itens do Pedido</h4>
                            <div className="space-y-2">
                              {order.itens && order.itens.length > 0 ? order.itens.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {item.quantidade}x {item.produto}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      R$ {Number(item.preco || 0).toFixed(2)} cada
                                    </p>
                                  </div>
                                  <span className="text-sm font-bold text-primary-600 ml-3">
                                    R$ {(Number(item.preco || 0) * Number(item.quantidade || 0)).toFixed(2)}
                                  </span>
                                </div>
                              )) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p className="text-sm">Nenhum item encontrado</p>
                                </div>
                              )}
                              
                              {/* Total */}
                              <div className="border-t border-gray-200 pt-2 mt-3">
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-base font-bold text-gray-900">Total:</span>
                                  <span className="text-lg font-bold text-green-600">
                                    R$ {Number(order.total || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Forma de pagamento:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {order.formaPagamento || 'Não informado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Observações */}
                          {order.observacoes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Observações</h4>
                              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                {order.observacoes}
                              </p>
                            </div>
                          )}

                          {/* Ações */}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {order.status === 'PENDENTE' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'PREPARANDO')}
                                  className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Iniciar Preparação
                                </button>
                              )}
                              {order.status === 'PREPARANDO' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'PRONTO')}
                                  className="w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Marcar como Pronto
                                </button>
                              )}
                              {order.status === 'PRONTO' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'ENTREGUE')}
                                  className="w-full px-4 py-3 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  Marcar como Entregue
                                </button>
                              )}
                              {['PENDENTE', 'PREPARANDO'].includes(order.status) && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'CANCELADO')}
                                  className="w-full px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Cancelar Pedido
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
