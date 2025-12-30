'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Plus, Users, Search, Edit, Trash2, X, Mail, Phone, MapPin } from 'lucide-react'
import AppLayout from '../../src/components/layout/AppLayout'

interface Customer {
  id: string
  nome: string
  email?: string
  telefone?: string
  endereco?: string
  dataNascimento?: string
  observacoes?: string
  createdAt: string
}

export default function ClientesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      loadClientes()
    }
  }, [status, router])

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Carregando clientes...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
            <p className="text-gray-600">Base de clientes e programa de fidelidade</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <span className="text-2xl mr-4">👥</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{clientes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <span className="text-2xl mr-4">⭐</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pontos Totais</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {clientes.reduce((sum, cliente) => sum + cliente.pontosFidelidade, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <span className="text-2xl mr-4">🎂</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Aniversariantes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {clientes.filter(c => {
                      if (!c.dataNascimento) return false
                      const hoje = new Date()
                      const nascimento = new Date(c.dataNascimento)
                      return nascimento.getMonth() === hoje.getMonth()
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500">Este mês</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pontos Fidelidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente desde
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.nome}
                            </div>
                            {cliente.dataNascimento && (
                              <div className="text-sm text-gray-500">
                                Nascimento: {formatDate(new Date(cliente.dataNascimento))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cliente.email || '-'}</div>
                        <div className="text-sm text-gray-500">{cliente.telefone || '-'}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">⭐</span>
                          <span className="text-sm font-medium text-gray-900">
                            {cliente.pontosFidelidade} pontos
                          </span>
                        </div>
                        {cliente.pontosFidelidade >= 100 && (
                          <div className="text-xs text-green-600">
                            🎁 Elegível para desconto
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(new Date(cliente.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {clientes.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente cadastrado
              </h3>
              <p className="text-gray-600">
                Os clientes aparecerão aqui conforme forem fazendo pedidos
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}