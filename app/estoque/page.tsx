'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Package, Search, Plus, Edit, AlertTriangle, TrendingUp, TrendingDown, Box, Minus } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

interface StockItem {
  id: string
  produtoId: string
  produto: { nome: string; categoria: string; }
  quantidade: number
  quantidadeMinima: number
  unidade: string
  ultimaMovimentacao: string
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
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editQuantityMin, setEditQuantityMin] = useState(0)

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
      const response = await fetch('/api/estoque')
      if (response.ok) {
        const stockData = await response.json()
        setStockItems(stockData)
      } else {
        console.error('Erro ao carregar estoque:', response.statusText)
        // Fallback com dados de exemplo em caso de erro
        setStockItems([
          {
            id: '1',
            produtoId: '1',
            produto: { nome: 'Bolo de Chocolate', categoria: 'Bolos' },
            quantidade: 15,
            quantidadeMinima: 10,
            unidade: 'unidade',
            ultimaMovimentacao: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar estoque:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockAdjustment = async (itemId: string, adjustment: number) => {
    try {
      const currentItem = stockItems.find(item => item.id === itemId)
      if (!currentItem) return
      
      const newQuantity = Math.max(0, currentItem.quantidade + adjustment)
      const motivo = adjustment > 0 ? 'Entrada manual' : 'Saída manual'
      
      const response = await fetch('/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: itemId,
          quantidade: newQuantity,
          motivo
        })
      })
      
      if (response.ok) {
        const { stock } = await response.json()
        setStockItems(items =>
          items.map(item => item.id === itemId ? stock : item)
        )
      } else {
        alert('Erro ao atualizar estoque')
      }
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error)
      alert('Erro ao atualizar estoque')
    }
  }

  const syncProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/estoque/sync', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.syncedProducts > 0) {
          alert(`✅ ${result.syncedProducts} produtos foram sincronizados com o estoque!`)
        } else {
          alert('✅ Todos os produtos já estão sincronizados.')
        }
        // Recarregar dados após sincronização
        await loadStockData()
      } else {
        alert('❌ Erro ao sincronizar produtos')
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      alert('❌ Erro ao sincronizar produtos')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (item: StockItem) => {
    setEditingItem(item)
    setEditQuantityMin(item.quantidadeMinima)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setEditingItem(null)
    setShowEditModal(false)
    setEditQuantityMin(0)
  }

  const handleUpdateMinStock = async () => {
    if (!editingItem) return
    
    try {
      const response = await fetch('/api/estoque', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: editingItem.id,
          quantidadeMinima: editQuantityMin
        })
      })
      
      if (response.ok) {
        const { stock } = await response.json()
        setStockItems(items =>
          items.map(item => item.id === editingItem.id ? stock : item)
        )
        closeEditModal()
      } else {
        alert('Erro ao atualizar estoque mínimo')
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque mínimo:', error)
      alert('Erro ao atualizar estoque mínimo')
    }
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <Box className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estoque</h1>
                <p className="text-sm sm:text-base text-gray-600">Controle de inventário e movimentações</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {lowStockCount > 0 && (
                <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-xs sm:text-sm">{lowStockCount} itens com estoque baixo</span>
                </div>
              )}
              <button
                onClick={syncProducts}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
                title="Sincronizar produtos com estoque"
              >
                <TrendingUp className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
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
            <>
              {/* Layout Desktop - Tabela */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
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
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                  title="Editar estoque mínimo"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
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

              {/* Layout Mobile - Cards */}
              <div className="lg:hidden space-y-4">
                {filteredItems.map((item) => {
                  const isLowStock = item.quantidade <= item.quantidadeMinima
                  
                  return (
                    <div key={item.id} className={`bg-white rounded-lg shadow-sm border ${isLowStock ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'} p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 text-sm">{item.produto.nome}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.produto.categoria}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Estoque Atual</p>
                          <p className="font-medium text-gray-900">{item.quantidade} {item.unidade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 flex items-center">
                            Estoque Mínimo
                            <button
                              onClick={() => openEditModal(item)}
                              className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                              title="Editar"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </p>
                          <p className="font-medium text-gray-900">{item.quantidadeMinima} {item.unidade}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isLowStock ? (
                            <div className="flex items-center text-yellow-700">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Estoque baixo</span>
                            </div>
                          ) : (
                            <span className="text-xs text-green-700">Adequado</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleStockAdjustment(item.id, -1)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={item.quantidade <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium text-gray-900 min-w-[2ch] text-center">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => handleStockAdjustment(item.id, 1)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeEditModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Editar Estoque Mínimo
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Produto: {editingItem.produto.nome}
                        </label>
                        <p className="text-sm text-gray-500">
                          Estoque atual: {editingItem.quantidade} {editingItem.unidade}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estoque Mínimo
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editQuantityMin}
                          onChange={(e) => setEditQuantityMin(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleUpdateMinStock}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}