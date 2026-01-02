'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingBag, Search, Plus, Edit, Package, X } from 'lucide-react'
import AppLayout from '../../src/components/layout/AppLayout'

interface Product {
  id: string
  nome: string
  descricao: string
  preco: number | string
  categoria: string
  ativo: boolean
}

export default function ProdutosPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/produtos')
      
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.categoria.trim()) {
      alert('Nome e categoria são obrigatórios')
      return
    }

    const productData = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || '',
      preco: parseFloat(formData.preco) || 0,
      categoria: formData.categoria.trim(),
      ativo: true
    }

    try {
      let response
      if (editingProduct) {
        response = await fetch(`/api/produtos/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      } else {
        response = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      }

      if (response.ok) {
        setFormData({ nome: '', descricao: '', preco: '', categoria: '' })
        setShowForm(false)
        setEditingProduct(null)
        loadProducts() // Recarregar a lista
      } else {
        alert('Erro ao salvar produto')
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nome: product.nome || '',
      descricao: product.descricao || '',
      preco: Number(product.preco || 0).toString(),
      categoria: product.categoria || ''
    })
    setShowForm(true)
  }

  const filteredProducts = products.filter(product => {
    if (!product || !product.nome) return false
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = product.nome.toLowerCase().includes(searchLower) ||
      (product.categoria && product.categoria.toLowerCase().includes(searchLower))
    
    return matchesSearch
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Faça login para acessar esta página</p>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <ShoppingBag className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null)
                setFormData({ nome: '', descricao: '', preco: '', categoria: '' })
                setShowForm(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </button>
          </div>

          {/* Barra de Pesquisa */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button 
                      onClick={() => setShowForm(false)} 
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Produto *
                      </label>
                      <input
                        id="nome"
                        type="text"
                        placeholder="Ex: Brigadeiro Tradicional"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <input
                        id="descricao"
                        type="text"
                        placeholder="Descrição do produto (opcional)"
                        value={formData.descricao}
                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
                          Preço (R$) *
                        </label>
                        <input
                          id="preco"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                          value={formData.preco}
                          onChange={(e) => setFormData({...formData, preco: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria *
                        </label>
                        <input
                          id="categoria"
                          type="text"
                          placeholder="Ex: Doces, Salgados"
                          required
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                      >
                        {editingProduct ? 'Atualizar' : 'Criar'} Produto
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

          {/* Lista de Produtos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Comece criando seu primeiro produto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.nome}</h3>
                      <p className="text-sm text-gray-500">{product.categoria}</p>
                    </div>
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-primary-700 hover:bg-primary-50 rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{product.descricao}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      R$ {Number(product.preco || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </span>
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