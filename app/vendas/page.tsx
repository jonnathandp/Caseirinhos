'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { TrendingUp, Calendar, DollarSign, ShoppingBag } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

interface Sale {
  id: string
  data: string
  cliente: string
  produtos: string[]
  total: number
  metodo: string
}

export default function VendasPage() {
  const { data: session, status } = useSession()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

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
  }, [session])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vendas')
      
      if (response.ok) {
        const data = await response.json()
        setSales(data.vendas || [])
      } else {
        console.error('Erro ao carregar vendas')
        setSales([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error)
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = sales.length

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
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            </div>
            <p className="text-gray-600">Acompanhe as vendas e relatórios</p>
          </div>

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
                        R$ {totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}
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

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Vendas Recentes</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Lista das vendas realizadas</p>
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
              <ul className="divide-y divide-gray-200">
                {sales.slice(0, 10).map((sale) => (
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
                            {sale.produtos.length} {sale.produtos.length === 1 ? 'item' : 'itens'} • {sale.metodo}
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
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
