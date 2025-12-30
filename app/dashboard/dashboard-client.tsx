'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  LogOut,
  Menu
} from 'lucide-react'
import { formatCurrency } from '@/utils'
import type { DashboardStats } from '@/types'

interface DashboardClientProps {
  session: any
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Erro ao carregar estatísticas:', response.status)
          // Usar dados padrão em caso de erro
          setStats({
            vendas: { hoje: 0, semana: 0, mes: 0 },
            pedidos: { total: 0, pendentes: 0, prontos: 0 },
            produtos: { total: 0, estoqueBaixo: 0 },
            clientes: { total: 0, novos: 0 }
          })
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        // Usar dados padrão em caso de erro
        setStats({
          vendas: { hoje: 0, semana: 0, mes: 0 },
          pedidos: { total: 0, pendentes: 0, prontos: 0 },
          produtos: { total: 0, estoqueBaixo: 0 },
          clientes: { total: 0, novos: 0 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/dashboard" className="text-2xl">🍰</a>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Caseirinhos Delicious
                </h1>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a 
                  href="/produtos" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Produtos
                </a>
                <a 
                  href="/pedidos" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Pedidos
                </a>
                <a 
                  href="/clientes" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Clientes
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.tipo}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats?.vendas.hoje || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <a 
                href="/pedidos" 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pedidos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.pedidos.total || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats?.pedidos.pendentes || 0} pendentes
                    </p>
                  </div>
                </div>
              </a>

              <a 
                href="/produtos" 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Produtos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.produtos.total || 0}
                    </p>
                    {(stats?.produtos.estoqueBaixo || 0) > 0 && (
                      <p className="text-xs text-red-500 flex items-center">
                        <AlertTriangle size={12} className="mr-1" />
                        {stats?.produtos.estoqueBaixo} com estoque baixo
                      </p>
                    )}
                  </div>
                </div>
              </a>

              <a 
                href="/clientes" 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.clientes.total || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats?.clientes.novos || 0} novos este mês
                    </p>
                  </div>
                </div>
              </a>
            </div>

            {/* Sales Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vendas do Período
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hoje</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.vendas.hoje || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Esta Semana</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.vendas.semana || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Este Mês</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.vendas.mes || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status dos Pedidos
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pendentes</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {stats?.pedidos.pendentes || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prontos</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {stats?.pedidos.prontos || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">
                      {stats?.pedidos.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/produtos"
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium">Gerenciar Produtos</span>
                  </div>
                </a>
                
                <a 
                  href="/pedidos"
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium">Novo Pedido</span>
                  </div>
                </a>
                
                <a 
                  href="/clientes"
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium">Gerenciar Clientes</span>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}