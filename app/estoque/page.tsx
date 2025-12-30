'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Package, Search, Plus, Edit, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import AppLayout from '../../src/components/layout/AppLayout'

interface StockItem {
  id: string
  produtoId: string
  nomeProduto: string
  quantidadeAtual: number
  quantidadeMinima: number
  ultimaMovimentacao: string
  tipoMovimentacao: 'entrada' | 'saida'
  observacoes?: string
}

interface StockMovement {
  id: string
  produtoId: string
  quantidade: number
  tipo: 'entrada' | 'saida'
  motivo: string
  data: string
  usuario: string
}

export default function EstoquePage() {
  const { data: session, status } = useSession()
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      loadStockData()
    }
  }, [session])

  const loadStockData = async () => {
    try {
      // Simular dados de estoque
      const stockData = [
        {
          id: '1',
          produtoId: '1',
          produto: { nome: 'Bolo de Chocolate', categoria: 'Bolos' },
          quantidade: 15,
          quantidadeMinima: 10,
          unidade: 'unidade',
          ultimaMovimentacao: new Date().toISOString()
        },
        {
          id: '2',
          produtoId: '2',
          produto: { nome: 'Brigadeiro Gourmet', categoria: 'Doces' },
          quantidade: 3,
          quantidadeMinima: 20,
          unidade: 'unidade',
          ultimaMovimentacao: new Date().toISOString()
        },
        {
          id: '3',
          produtoId: '3',
          produto: { nome: 'Torta de Morango', categoria: 'Tortas' },
          quantidade: 25,
          quantidadeMinima: 5,
          unidade: 'unidade',
          ultimaMovimentacao: new Date().toISOString()
        }
      ]
      setStockItems(stockData)
    } catch (error) {
      console.error('Erro ao carregar estoque:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockAdjustment = (itemId: string, adjustment: number) => {
    setStockItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantidade: Math.max(0, item.quantidade + adjustment),
              ultimaMovimentacao: new Date().toISOString()
            }
          : item
      )
    )
  }

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLowStock = !showLowStock || item.quantidade <= item.quantidadeMinima
    return matchesSearch && matchesLowStock
  })

  const lowStockCount = stockItems.filter(item => item.quantidade <= item.quantidadeMinima).length

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <BoxIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
                <p className="text-gray-600">Controle de inventário e movimentações</p>
              </div>
            </div>
            {lowStockCount > 0 && (
              <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">{lowStockCount} itens com estoque baixo</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Apenas estoque baixo</span>
              </label>
            </div>
          </div>

          {/* Stock Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-600">Ajuste os filtros para ver mais itens.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estoque Atual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estoque Mínimo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                      const isLowStock = item.quantidade <= item.quantidadeMinima
                      
                      return (
                        <tr key={item.id} className={isLowStock ? 'bg-yellow-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.produto.nome}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.produto.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.quantidade} {item.unidade}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.quantidadeMinima} {item.unidade}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isLowStock ? (
                              <div className="flex items-center text-yellow-700">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="text-sm">Estoque baixo</span>
                              </div>
                            ) : (
                              <span className="text-sm text-green-700">Adequado</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleStockAdjustment(item.id, -1)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                disabled={item.quantidade <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-gray-700 font-medium min-w-[3ch] text-center">
                                {item.quantidade}
                              </span>
                              <button
                                onClick={() => handleStockAdjustment(item.id, 1)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}