'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Users, Search, Plus, Edit, Mail, Phone, MapPin, X } from 'lucide-react'
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
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    dataNascimento: '',
    observacoes: ''
  })

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
      // Simulando dados de clientes
      const customersData = [
        {
          id: '1',
          nome: 'Maria Silva',
          email: 'maria.silva@email.com',
          telefone: '(11) 99999-1111',
          endereco: 'Rua das Flores, 123',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'João Santos',
          email: 'joao.santos@email.com',
          telefone: '(11) 99999-2222',
          endereco: 'Av. Principal, 456',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCustomer) {
        setCustomers(customers.map(customer => 
          customer.id === editingCustomer.id 
            ? { ...customer, ...formData }
            : customer
        ))
      } else {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        }
        setCustomers([...customers, newCustomer])
      }

      setFormData({ nome: '', email: '', telefone: '', endereco: '', dataNascimento: '', observacoes: '' })
      setShowForm(false)
      setEditingCustomer(null)
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      nome: customer.nome,
      email: customer.email || '',
      telefone: customer.telefone || '',
      endereco: customer.endereco || '',
      dataNascimento: customer.dataNascimento || '',
      observacoes: customer.observacoes || ''
    })
    setShowForm(true)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.telefone && customer.telefone.includes(searchTerm))
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
                <p className="text-gray-600">Gerencie sua base de clientes</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Endereço"
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                      >
                        {editingCustomer ? 'Atualizar' : 'Criar'} Cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="relative">
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-600">Comece criando seu primeiro cliente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.nome}</h3>
                    <button 
                      onClick={() => handleEdit(customer)}
                      className="p-2 text-primary-700 hover:bg-primary-50 rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.email}
                      </div>
                    )}
                    {customer.telefone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.telefone}
                      </div>
                    )}
                    {customer.endereco && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.endereco}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Cliente desde {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}