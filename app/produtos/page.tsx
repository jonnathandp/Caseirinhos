'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Plus, Package, Search, Edit, Trash2, AlertTriangle, X } from 'lucide-react'
import AppLayout from '../../src/components/layout/AppLayout'

interface Product {
  id: string
  nome: string
  preco: number
  categoria: string
  descricao?: string
  estoque: number
}

export default function ProdutosPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    categoria: '',
    descricao: '',
    estoque: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      loadProducts()
    }
  }, [session])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct ? `/api/produtos/${editingProduct.id}` : '/api/produtos'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          estoque: parseInt(formData.estoque)
        }),
      })

      if (response.ok) {
        setFormData({ nome: '', preco: '', categoria: '', descricao: '', estoque: '' })
        setShowForm(false)
        setEditingProduct(null)
        loadProducts()
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nome: product.nome,
      preco: product.preco.toString(),
      categoria: product.categoria,
      descricao: product.descricao || '',
      estoque: product.estoque.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id))
        setShowDeleteModal(false)
        setProductToDelete(null)
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
    }
  }

  const openDeleteModal = (id: string) => {
    setProductToDelete(id)
    setShowDeleteModal(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({ nome: '', preco: '', categoria: '', descricao: '', estoque: '' })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.categoria)))]

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
              <Package className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                <p className="text-gray-600">Gerencie seus produtos e estoque</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </button>
          </div>
  }, [status, router])

  const loadProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProdutos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          nome: '', categoria: '', preco: '', custo: '', descricao: '',
          imagem: '', quantidadeInicial: '', quantidadeMinima: '5', unidade: 'unidade'
        })
        setShowForm(false)
        loadProdutos()
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Carregando produtos...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Produtos</h1>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h2>
              <p className="text-gray-600">Gerencie o cardápio da sua doceria</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              + Novo Produto
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Adicionar Produto</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Bolos">Bolos</option>
                      <option value="Brigadeiros">Brigadeiros</option>
                      <option value="Cupcakes">Cupcakes</option>
                      <option value="Tortas">Tortas</option>
                      <option value="Salgados">Salgados</option>
                      <option value="Doces">Doces</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.custo}
                        onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Inicial</label>
                      <input
                        type="number"
                        value={formData.quantidadeInicial}
                        onChange={(e) => setFormData({ ...formData, quantidadeInicial: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                      <input
                        type="number"
                        value={formData.quantidadeMinima}
                        onChange={(e) => setFormData({ ...formData, quantidadeMinima: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      Adicionar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <div key={produto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🧁</span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {produto.categoria}
                    </span>
                  </div>
                  
                  {produto.descricao && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-primary-600">
                        {formatCurrency(produto.preco)}
                      </p>
                      {produto.custo > 0 && (
                        <p className="text-xs text-gray-500">
                          Custo: {formatCurrency(produto.custo)}
                        </p>
                      )}
                    </div>
                    
                    {produto.estoque && (
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          produto.estoque.quantidade <= produto.estoque.quantidadeMinima 
                            ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {produto.estoque.quantidade} {produto.estoque.unidade}
                        </p>
                        <p className="text-xs text-gray-500">Em estoque</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {produtos.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🧁</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione produtos ao seu cardápio para começar a vender
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Adicionar Primeiro Produto
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}