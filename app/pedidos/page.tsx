'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusText } from '@/utils'

interface Pedido {
  id: string
  clienteNome: string
  total: number
  status: string
  tipoEntrega: string
  dataPedido: Date
  dataEntrega?: Date
  observacoes?: string
  items: Array<{
    id: string
    produtoNome: string
    quantidade: number
    precoUnitario: number
    subtotal: number
  }>
  cliente?: {
    nome: string
    telefone?: string
    endereco?: string
  }
}

export default function Pedidos() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('TODOS')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      loadPedidos()
    }
  }, [status, router])

  const loadPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos')
      if (response.ok) {
        const data = await response.json()
        setPedidos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (response.ok) {
        loadPedidos()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const filteredPedidos = pedidos.filter(pedido => 
    filter === 'TODOS' || pedido.status === filter
  )

  const statusOptions = [
    'PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'
  ]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/simple-dashboard" className="text-2xl mr-4">🍰</a>
              <h1 className="text-xl font-semibold text-gray-900">Pedidos</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h2>
              <p className="text-gray-600">Acompanhe e gerencie os pedidos</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="TODOS">Todos os Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {getOrderStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {statusOptions.slice(0, 4).map((statusType) => {
              const count = pedidos.filter(p => p.status === statusType).length
              return (
                <div key={statusType} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{getOrderStatusText(statusType)}</p>
                      <p className="text-2xl font-semibold text-gray-900">{count}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      statusType === 'PENDENTE' ? 'bg-yellow-400' :
                      statusType === 'CONFIRMADO' ? 'bg-blue-400' :
                      statusType === 'PREPARANDO' ? 'bg-orange-400' :
                      'bg-green-400'
                    }`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{pedido.id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pedido.items.length} {pedido.items.length === 1 ? 'item' : 'itens'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pedido.clienteNome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pedido.tipoEntrega}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(pedido.total)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(pedido.status)}`}>
                          {getOrderStatusText(pedido.status)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(new Date(pedido.dataPedido))}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={pedido.status}
                          onChange={(e) => updateStatus(pedido.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {getOrderStatusText(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredPedidos.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📋</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-600">
                {filter === 'TODOS' 
                  ? 'Ainda não há pedidos cadastrados no sistema'
                  : `Não há pedidos com status ${getOrderStatusText(filter)}`
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}