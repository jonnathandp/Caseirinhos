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
}

export default function VendasPage() {
  const { data: session, status } = useSession()
  const [sales, setSales] = useState<Sale[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7')

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
  }, [session, selectedPeriod])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendas?periodo=${selectedPeriod}`)
      
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
                <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
                <p className="text-gray-600">Relatórios e análises de vendas</p>
              </div>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
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

          {/* Daily Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Diária</h3>
            <div className="space-y-4">
              {dailyStats.map((stat, index) => (
                <div key={stat.data} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(stat.data).toLocaleDateString('pt-BR', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: 'short' 
                      })}
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
                <p className="text-gray-600">As vendas aparecerão aqui quando forem realizadas.</p>
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
    </AppLayout>
  )
}