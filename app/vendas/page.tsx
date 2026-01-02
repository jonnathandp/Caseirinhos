'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { TrendingUp, Calendar, DollarSign, ShoppingBag, User, BarChart3 } from 'lucide-react'
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

  const handleSeedVendas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seed-vendas', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}`)
        loadSalesData()
      } else {
        alert('❌ Erro ao criar vendas de exemplo')
      }
    } catch (error) {
      console.error('Erro ao criar vendas:', error)
      alert('❌ Erro ao conectar com o servidor')
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
                <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
                <p className="text-gray-600">Relatórios e análises de vendas</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Toggle de Visualização */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('daily')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewType === 'daily'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setViewType('closing')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewType === 'closing'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Diário
                </button>
                <button
                  onClick={() => setViewType('weekly')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewType === 'weekly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setViewType('monthly')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewType === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensal
                </button>
              </div>
              
              {/* Seletores Específicos */}
              {viewType === 'closing' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              )}
              
              {viewType === 'monthly' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Selecione o mês"
                />
              )}
              
              {(viewType === 'daily' || viewType === 'weekly') && (
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {averageTicket.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo de Fechamento - Semanal/Mensal */}
          {(viewType === 'weekly' || viewType === 'monthly') && dailyStats.length > 0 && (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-8 border border-primary-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Resumo do Fechamento {viewType === 'weekly' ? 'Semanal' : 'Mensal'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Períodos Analisados</p>
                  <p className="text-2xl font-bold text-primary-600">{dailyStats.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Melhor Período</p>
                  <div className="text-sm font-medium text-gray-900">
                    {(() => {
                      const melhorPeriodo = dailyStats.reduce((max, curr) => 
                        curr.faturamento > max.faturamento ? curr : max, dailyStats[0])
                      return viewType === 'weekly' ? melhorPeriodo.periodo : melhorPeriodo.data
                    })()}
                    <br />
                    <span className="text-primary-600 font-bold">
                      R$ {dailyStats.reduce((max, curr) => 
                        curr.faturamento > max.faturamento ? curr : max, dailyStats[0]).faturamento.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Média por {viewType === 'weekly' ? 'Semana' : 'Mês'}</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(dailyStats.reduce((sum, stat) => sum + stat.faturamento, 0) / dailyStats.length).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dailyStats.reduce((sum, stat) => sum + stat.vendas, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                {viewType === 'daily' ? 'Performance Total' : 
                 viewType === 'closing' ? 'Fechamento do Dia' :
                 viewType === 'weekly' ? 'Performance Semanal' : 
                 'Performance Mensal'}
              </h3>
              {/* Ações Rápidas para Fechamento */}
              {(viewType === 'weekly' || viewType === 'monthly') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const totalPeriodos = dailyStats.length
                      const totalFaturamento = dailyStats.reduce((sum, stat) => sum + stat.faturamento, 0)
                      const mediaPorPeriodo = totalFaturamento / totalPeriodos
                      alert(`📊 Resumo do Fechamento ${viewType === 'weekly' ? 'Semanal' : 'Mensal'}:\n\n` +
                        `• ${totalPeriodos} ${viewType === 'weekly' ? 'semanas' : 'meses'} analisados\n` +
                        `• Faturamento Total: R$ ${totalFaturamento.toFixed(2)}\n` +
                        `• Média por ${viewType === 'weekly' ? 'semana' : 'mês'}: R$ ${mediaPorPeriodo.toFixed(2)}`)
                    }}
                    className="px-3 py-1.5 text-xs bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                  >
                    📋 Resumo
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    📄 Relatório
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {dailyStats.map((stat, index) => (
                <div key={stat.data || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      {viewType === 'daily' ? (
                        new Date(stat.data).toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: 'short' 
                        })
                      ) : viewType === 'weekly' ? (
                        stat.periodo || stat.data
                      ) : (
                        stat.periodo || stat.data
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Vendas</p>
                      <p className="font-semibold text-gray-900">{stat.vendas}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Faturamento</p>
                      <p className="font-semibold text-gray-900">R$ {stat.faturamento.toFixed(2)}</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(stat.faturamento / Math.max(...dailyStats.map(s => s.faturamento))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
                <p className="text-gray-600 mb-6">As vendas aparecerão aqui quando forem realizadas.</p>
                <button
                  onClick={handleSeedVendas}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  📦 Criar Vendas de Exemplo
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produtos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(sale.data).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(sale.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{sale.cliente}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {sale.produtos.slice(0, 2).join(', ')}
                            {sale.produtos.length > 2 && (
                              <span className="text-gray-500"> +{sale.produtos.length - 2} mais</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{sale.produtos.length}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' +
                            (getPaymentMethodColor(sale.metodo))
                          }>
                            {getPaymentMethodName(sale.metodo)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">R$ {sale.total.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de Relatório */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            {/* Cabeçalho do Relatório */}
            <div className="bg-primary-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    🎂 Caseirinhos Deliciosos - Relatório de Vendas
                  </h2>
                  <p className="text-primary-100">
                    {viewType === 'daily' ? 'Relatório Total' : 
                     viewType === 'closing' ? `Fechamento do Dia ${selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : ''}` :
                     viewType === 'weekly' ? 'Relatório Semanal' : 
                     `Fechamento de ${selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'}) : 'Mês'}`}
                  </p>
                  <p className="text-primary-200 text-sm">
                    Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white hover:text-primary-200 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Conteúdo do Relatório */}
            <div className="p-6">
              {/* Resumo Geral */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-primary-200 pb-2">
                  📈 Resumo Geral
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-500 rounded-full p-2 mr-3">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Faturamento Total</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-700">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-500 rounded-full p-2 mr-3">
                        <ShoppingBag className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Total de Vendas</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{totalSales} pedidos</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-purple-500 rounded-full p-2 mr-3">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Ticket Médio</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">R$ {averageTicket.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Performance por Período */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-primary-200 pb-2">
                  📅 Performance por Período
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                          {viewType === 'daily' || viewType === 'closing' ? 'Data' : 'Período'}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">Vendas</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Faturamento</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">Participação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyStats.map((stat, index) => {
                        const participacao = totalRevenue > 0 ? (stat.faturamento / totalRevenue * 100) : 0
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                              {viewType === 'daily' || viewType === 'closing' ? (
                                new Date(stat.data).toLocaleDateString('pt-BR', { 
                                  weekday: 'short', 
                                  day: '2-digit', 
                                  month: 'short' 
                                })
                              ) : (
                                stat.periodo || stat.data
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-b">{stat.vendas}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 border-b font-semibold">
                              R$ {stat.faturamento.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-b">
                              <div className="flex items-center justify-center">
                                <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: `${participacao}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{participacao.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Estatísticas Adicionais */}
              {(viewType === 'weekly' || viewType === 'monthly') && dailyStats.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-primary-200 pb-2">
                    📊 Estatísticas do Fechamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700 font-medium">Períodos Analisados</p>
                      <p className="text-2xl font-bold text-amber-800">{dailyStats.length}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700 font-medium">Melhor Período</p>
                      <div className="text-sm font-medium text-emerald-900">
                        {(() => {
                          const melhor = dailyStats.reduce((max, curr) => 
                            curr.faturamento > max.faturamento ? curr : max, dailyStats[0])
                          return viewType === 'weekly' ? melhor.periodo : melhor.data
                        })()}
                        <br />
                        <span className="text-emerald-700 font-bold">
                          R$ {dailyStats.reduce((max, curr) => 
                            curr.faturamento > max.faturamento ? curr : max, dailyStats[0]).faturamento.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <p className="text-sm text-cyan-700 font-medium">Média por {viewType === 'weekly' ? 'Semana' : 'Mês'}</p>
                      <p className="text-lg font-bold text-cyan-800">
                        R$ {(dailyStats.reduce((sum, stat) => sum + stat.faturamento, 0) / dailyStats.length).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <p className="text-sm text-indigo-700 font-medium">Total de Vendas</p>
                      <p className="text-lg font-bold text-indigo-800">
                        {dailyStats.reduce((sum, stat) => sum + stat.vendas, 0)} pedidos
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rodapé */}
              <div className="border-t pt-4 mt-8">
                <div className="text-center text-gray-500 text-sm">
                  <p>🎂 <strong>Caseirinhos Deliciosos</strong> - Sistema de Gestão</p>
                  <p>Relatório gerado automaticamente em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
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