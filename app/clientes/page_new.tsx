'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AppLayout from '@/src/components/layout/AppLayout'
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  UserPlus,
  Edit2,
  Trash2 
} from 'lucide-react'

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
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      loadCustomers()
    }
  }, [session])

  const loadCustomers = async () => {
    try {
      // Dados mockados para demonstração
      const customersData = [
        {
          id: '1',
          nome: 'Maria Silva',
          email: 'maria@email.com',
          telefone: '(11) 99999-1111',
          endereco: 'Rua das Flores, 123 - São Paulo, SP',
          dataNascimento: '1985-03-15',
          observacoes: 'Cliente preferencial',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'João Santos',
          email: 'joao@email.com',
          telefone: '(11) 99999-2222',
          endereco: 'Av. Principal, 456 - São Paulo, SP',
          dataNascimento: '1990-07-22',
          observacoes: '',
          createdAt: new Date().toISOString()
        }
      ]
      setCustomers(customersData)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telefone?.includes(searchTerm)
  )

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-600">Gerencie todos os clientes</p>
              </div>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Cliente
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Tente buscar com outros termos'
                  : 'Ainda não há clientes cadastrados no sistema'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {customer.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Cliente desde {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        {customer.email}
                      </div>
                    )}
                    
                    {customer.telefone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-3 text-gray-400" />
                        {customer.telefone}
                      </div>
                    )}
                    
                    {customer.endereco && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                        {customer.endereco}
                      </div>
                    )}
                    
                    {customer.dataNascimento && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        Nascimento: {new Date(customer.dataNascimento).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {customer.observacoes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Observações:</strong> {customer.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}