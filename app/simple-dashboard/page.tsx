'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SimpleDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-4">🍰</span>
              <h1 className="text-xl font-semibold text-gray-900">
                Caseirinhos Delicious
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
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

      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Bem-vindo ao sistema Caseirinhos Delicious!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sistema</p>
                  <p className="text-xl font-semibold text-gray-900">Funcionando</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuário</p>
                  <p className="text-xl font-semibold text-gray-900">Logado</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-4">
                  <span className="text-2xl">🗄️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Banco</p>
                  <p className="text-xl font-semibold text-gray-900">Conectado</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Funcionalidades do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/produtos"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🧁</span>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">Produtos</h4>
                    <p className="text-sm text-gray-600">Gerenciar cardápio e preços</p>
                  </div>
                </div>
              </a>

              <a
                href="/pedidos"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">Pedidos</h4>
                    <p className="text-sm text-gray-600">Controlar vendas e entregas</p>
                  </div>
                </div>
              </a>

              <a
                href="/clientes"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">Clientes</h4>
                    <p className="text-sm text-gray-600">Base de clientes e fidelidade</p>
                  </div>
                </div>
              </a>

              <a
                href="/estoque"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📦</span>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">Estoque</h4>
                    <p className="text-sm text-gray-600">Controle de ingredientes</p>
                  </div>
                </div>
              </a>

              <a
                href="/vendas"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">Vendas</h4>
                    <p className="text-sm text-gray-600">Relatórios e faturamento</p>
                  </div>
                </div>
              </a>

              <a
                href="/dashboard"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600">Dashboard Completo</h4>
                    <p className="text-sm text-gray-600">Métricas e gráficos</p>
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">🎉 Parabéns!</h4>
              <p className="text-sm text-blue-700">
                O sistema está funcionando perfeitamente! Clique nas opções acima para explorar 
                todas as funcionalidades da doceria.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}