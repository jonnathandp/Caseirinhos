'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { TrendingUp, Calendar, DollarSign, ShoppingBag, User } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

interface Sale {
  id: string
  data: string
  cliente: string
  clienteId?: string
  produtos: string[]
  total: number
  metodo: 'dinheiro' | 'pix' | 'cartao' | 'credito'
  status?: string
}

interface DailyStats {
  data: string
  vendas: number
  faturamento: number
  periodo?: string
}

export default function VendasPage() {
  const { data: session, status } = useSession()
  const [sales, setSales] = useState<Sale[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7')
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly' | 'closing'>('daily')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [itemsToShow, setItemsToShow] = useState(20)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      loadSalesData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, selectedPeriod, viewType, selectedDate, selectedMonth])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      let url = `/api/vendas?periodo=${selectedPeriod}&tipo=${viewType}`
      
      if (viewType === 'closing' && selectedDate) {
        url += `&data=${selectedDate}`
      }
      if (viewType === 'monthly' && selectedMonth) {
        url += `&mes=${selectedMonth}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setSales(data.vendas || [])
        setDailyStats(data.estatisticas || [])
      } else {
        console.error('Erro ao carregar vendas')
        setSales([])
        setDailyStats([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error)
      setSales([])
      setDailyStats([])
    } finally {
      setLoading(false)
    }
  }

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      dinheiro: 'bg-green-100 text-green-700',
      pix: 'bg-blue-100 text-blue-700',
      cartao: 'bg-purple-100 text-purple-700',
      credito: 'bg-yellow-100 text-yellow-700'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentMethodName = (method: string) => {
    const names = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      cartao: 'Cartão',
      credito: 'Crédito'
    }
    return names[method as keyof typeof names] || method
  }

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
              <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
                <p className="text-gray-600">Gerencie suas vendas e relatórios</p>
              </div>
            </div>
          </div>

          {/* Controles de Período */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* View Type Selector */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setViewType('daily')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'daily'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setViewType('closing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'closing'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Diário
                </button>
                <button
                  onClick={() => setViewType('weekly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'weekly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setViewType('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'monthly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mensal
                </button>
              </div>

              {/* Date/Month Selectors */}
              <div className="flex gap-4">
                {viewType === 'closing' && (
                  <div>
                    <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data:
                    </label>
                    <input
                      type="date"
                      id="selectedDate"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                )}

                {viewType === 'monthly' && (
                  <div>
                    <label htmlFor="selectedMonth" className="block text-sm font-medium text-gray-700 mb-1">
                      Mês:
                    </label>
                    <input
                      type="month"
                      id="selectedMonth"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                )}

                {viewType === 'daily' && (
                  <div>
                    <label htmlFor="selectedPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                      Últimos:
                    </label>
                    <select
                      id="selectedPeriod"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="7">7 dias</option>
                      <option value="15">15 dias</option>
                      <option value="30">30 dias</option>
                      <option value="90">90 dias</option>
                      <option value="365">1 ano</option>
                      <option value="999999">Todas as vendas</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Faturamento</dt>
                      <dd className="text-lg font-medium text-gray-900">R$ {totalRevenue.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total de Vendas</dt>
                      <dd className="text-lg font-medium text-gray-900">{totalSales}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Ticket Médio</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        R$ {averageTicket.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                      <dd className="text-lg font-medium text-green-600">Ativo</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowReportModal(true)}
              disabled={sales.length === 0}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Relatório de Fechamento
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Vendas Recentes</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Lista das vendas realizadas {totalSales > 0 && `(${totalSales} total)`}
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando vendas...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma venda</h3>
                <p className="mt-1 text-sm text-gray-500">Ainda não há vendas registradas no sistema.</p>
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-gray-200">
                  {sales.slice(0, itemsToShow).map((sale) => (
                    <li key={sale.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{sale.cliente}</div>
                            <div className="text-sm text-gray-500">
                              {sale.produtos.length} {sale.produtos.length === 1 ? 'item' : 'itens'} • {getPaymentMethodName(sale.metodo)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">R$ {sale.total.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(sale.data).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Controles de Paginação */}
                {sales.length > itemsToShow && (
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{itemsToShow}</span> de{' '}
                      <span className="font-medium">{sales.length}</span> vendas
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setItemsToShow(prev => Math.min(prev + 50, sales.length))}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Carregar mais 50
                      </button>
                      <button
                        onClick={() => setItemsToShow(sales.length)}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Mostrar todas ({sales.length})
                      </button>
                    </div>
                  </div>
                )}
                
                {itemsToShow >= sales.length && sales.length > 20 && (
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                    <p className="text-sm text-gray-700">
                      Mostrando todas as <span className="font-medium">{sales.length}</span> vendas
                    </p>
                    <button
                      onClick={() => setItemsToShow(20)}
                      className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      Mostrar apenas 20
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de Relatório Simplificado */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto w-full">
            {/* Cabeçalho Simplificado */}
            <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  🍰 Relatório de Fechamento
                </h2>
                <p className="text-primary-200 text-sm">
                  {viewType === 'daily' ? 'Período Total' : 
                   viewType === 'closing' ? `Dia ${selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : ''}` :
                   viewType === 'weekly' ? 'Relatório Semanal' : 
                   selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'}) : 'Mês'}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white hover:text-primary-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Resumo Principal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                  <p className="text-green-600 text-sm font-medium">Faturamento</p>
                  <p className="text-2xl font-bold text-green-700">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                  <p className="text-blue-600 text-sm font-medium">Vendas</p>
                  <p className="text-2xl font-bold text-blue-700">{totalSales}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
                  <p className="text-purple-600 text-sm font-medium">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-700">R$ {averageTicket.toFixed(2)}</p>
                </div>
              </div>

              {/* Lista de Vendas Simplificada */}
              {sales.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                    📋 Vendas do Período
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sales.map((sale, index) => (
                      <div key={sale.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">#{String(index + 1).padStart(3, '0')}</span>
                            <span className="font-medium text-gray-900">{sale.cliente}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(sale.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} • 
                            {sale.produtos.length} {sale.produtos.length === 1 ? 'item' : 'itens'} • 
                            {getPaymentMethodName(sale.metodo)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-600">R$ {sale.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métodos de Pagamento */}
              {sales.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">💳 Métodos de Pagamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const metodos = sales.reduce((acc, sale) => {
                        // Usar o método de pagamento real da venda
                        const metodoRaw = sale.metodo || 'dinheiro'
                        const metodo = metodoRaw === 'dinheiro' ? 'Dinheiro' : 
                                     metodoRaw === 'pix' ? 'PIX' : 
                                     metodoRaw === 'cartao' ? 'Cartão' : 
                                     metodoRaw === 'credito' ? 'Crédito' : 
                                     String(metodoRaw).charAt(0).toUpperCase() + String(metodoRaw).slice(1)
                        
                        if (!acc[metodo]) {
                          acc[metodo] = { valor: 0, quantidade: 0 }
                        }
                        acc[metodo].valor += sale.total
                        acc[metodo].quantidade += 1
                        return acc
                      }, {} as Record<string, {valor: number, quantidade: number}>)
                      
                      return Object.entries(metodos).map(([metodo, dados]) => (
                        <div key={metodo} className="bg-gray-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600 font-medium">{metodo}</p>
                          <p className="font-semibold text-gray-900">R$ {dados.valor.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{dados.quantidade} {dados.quantidade === 1 ? 'venda' : 'vendas'}</p>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              )}

              {/* Rodapé */}
              <div className="text-center text-gray-400 text-xs pt-4 border-t">
                Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>

            {/* Botões */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
