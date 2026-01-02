'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
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
  Trash2,
  RefreshCw
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
  const [showModal, setShowModal] = useState(false)
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
      console.log('Carregando clientes da API...')
      // Buscar dados reais da API
      const response = await fetch('/api/clientes')
      
      if (response.ok) {
        const customersData = await response.json()
        console.log('Clientes carregados da API:', customersData.length)
        setCustomers(customersData)
      } else {
        console.error('Erro ao carregar clientes - Status:', response.status)
        const errorText = await response.text()
        console.error('Detalhes do erro:', errorText)
        
        // Em caso de erro, mostrar mensagem mas não usar fallback
        alert(`Erro ao carregar clientes: ${response.status}\nDetalhes: ${errorText}`)
        setCustomers([])
      }
    } catch (error) {
      console.error('Erro de rede ao carregar clientes:', error)
      
      // Só usar fallback se houver erro de conexão
      console.log('Usando dados de fallback devido a erro de rede')
      const fallbackData = [
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
      setCustomers(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        nome: customer.nome,
        email: customer.email || '',
        telefone: customer.telefone || '',
        endereco: customer.endereco || '',
        dataNascimento: customer.dataNascimento ? customer.dataNascimento.split('T')[0] : '',
        observacoes: customer.observacoes || ''
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        dataNascimento: '',
        observacoes: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCustomer(null)
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      dataNascimento: '',
      observacoes: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    try {
      const method = editingCustomer ? 'PUT' : 'POST'
      const body = editingCustomer 
        ? { ...formData, id: editingCustomer.id }
        : formData

      const response = await fetch('/api/clientes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        closeModal()
        loadCustomers()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar cliente')
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      alert('Erro ao salvar cliente')
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja remover o cliente ${nome}?`)) {
      return
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        loadCustomers()
        alert('Cliente removido com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao remover cliente')
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error)
      alert('Erro ao remover cliente')
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
            
            
            <div className="flex gap-2">
              <button 
                onClick={loadCustomers}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Recarregar
              </button>
              <button 
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </button>
            </div>
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
                      <button 
                        onClick={() => openModal(customer)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id, customer.nome)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remover cliente"
                      >
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
      {/* Modal do Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Rua, número - Bairro, Cidade, Estado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Informações adicionais sobre o cliente..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {editingCustomer ? 'Atualizar' : 'Criar'} Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}    </AppLayout>
  )
}
