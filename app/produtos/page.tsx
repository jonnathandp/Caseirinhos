'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingBag, Search, Plus, Edit, Package, X, Image, Trash2 } from 'lucide-react'
import AppLayout from '../../src/components/layout/AppLayout'

interface Product {
  id: string
  nome: string
  descricao: string | null
  preco: number | string
  custo: number | string
  categoria: string
  imagem: string | null
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
    custo: '',
    categoria: '',
    imagem: '',
    ativo: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG, GIF, WebP)')
      e.target.value = ''
      return
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 5MB')
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        const error = await response.json()
        alert(error.error || 'Erro no upload do arquivo')
        return null
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro no upload do arquivo')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.categoria.trim()) {
      alert('Nome e categoria são obrigatórios')
      return
    }

    let imageUrl = formData.imagem

    // Se há um arquivo selecionado, fazer upload primeiro
    if (selectedFile) {
      imageUrl = await uploadFile()
      if (imageUrl === null) {
        return // Erro no upload
      }
    }

    const productData = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || null,
      preco: parseFloat(formData.preco) || 0,
      custo: parseFloat(formData.custo) || 0,
      categoria: formData.categoria.trim(),
      imagem: imageUrl,
      ativo: formData.ativo
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
        setFormData({ 
          nome: '', 
          descricao: '', 
          preco: '', 
          custo: '',
          categoria: '',
          imagem: '',
          ativo: true 
        })
        setSelectedFile(null)
        setImagePreview(null)
        setShowForm(false)
        setEditingProduct(null)
        loadProducts()
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
      custo: Number(product.custo || 0).toString(),
      categoria: product.categoria || '',
      imagem: product.imagem || '',
      ativo: product.ativo
    })
    setSelectedFile(null)
    setImagePreview(product.imagem || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadProducts()
      } else {
        alert('Erro ao excluir produto')
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto')
    }
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
                setFormData({ 
                  nome: '', 
                  descricao: '', 
                  preco: '', 
                  custo: '',
                  categoria: '',
                  imagem: '',
                  ativo: true 
                })
                setSelectedFile(null)
                setImagePreview(null)
                setShowForm(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </button>
          </div>

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
            </div>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-8 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
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
                    {/* Nome e Categoria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Produto *
                        </label>
                        <input
                          id="nome"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Ex: Brigadeiro Gourmet"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria *
                        </label>
                        <select
                          id="categoria"
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="Doces">Doces</option>
                          <option value="Salgados">Salgados</option>
                          <option value="Bolos">Bolos</option>
                          <option value="Tortas">Tortas</option>
                          <option value="Bebidas">Bebidas</option>
                        </select>
                      </div>
                    </div>

                    {/* Preço e Custo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
                          Preço de Venda (R$) *
                        </label>
                        <input
                          id="preco"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.preco}
                          onChange={(e) => setFormData({...formData, preco: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="custo" className="block text-sm font-medium text-gray-700 mb-1">
                          Custo (R$)
                        </label>
                        <input
                          id="custo"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.custo}
                          onChange={(e) => setFormData({...formData, custo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Upload de Imagem */}
                    <div>
                      <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-1">
                        Imagem do Produto
                      </label>
                      <input
                        id="imagem"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Formatos aceitos: JPG, PNG, GIF, WebP (máximo 5MB)
                      </p>
                      
                      {/* Preview da imagem */}
                      {(imagePreview || formData.imagem) && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Preview:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null)
                                setSelectedFile(null)
                                setFormData({...formData, imagem: ''})
                                // Reset file input
                                const fileInput = document.getElementById('imagem') as HTMLInputElement
                                if (fileInput) fileInput.value = ''
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remover imagem
                            </button>
                          </div>
                          <img 
                            src={imagePreview || formData.imagem} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-md border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        id="descricao"
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Descrição opcional do produto"
                      />
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <input
                        id="ativo"
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                        Produto ativo
                      </label>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                          uploading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        {uploading 
                          ? 'Enviando...' 
                          : `${editingProduct ? 'Atualizar' : 'Criar'} Produto`
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente buscar por outro termo' : 'Comece criando seu primeiro produto'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Imagem do Produto */}
                  <div className="mb-4">
                    {product.imagem ? (
                      <img 
                        src={product.imagem} 
                        alt={product.nome}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).classList.remove('hidden')
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-48 bg-gray-100 rounded-md flex items-center justify-center ${product.imagem ? 'hidden' : ''}`}>
                      <div className="text-center">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Produto */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{product.nome}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{product.categoria}</p>
                  
                  {product.descricao && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.descricao}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-medium text-green-600">
                        R$ {parseFloat(product.preco.toString()).toFixed(2)}
                      </span>
                    </div>
                    {product.custo && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Custo:</span>
                          <span className="text-gray-800">
                            R$ {parseFloat(product.custo?.toString() || '0').toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Margem:</span>
                          <span className="font-medium text-blue-600">
                            {(((parseFloat(product.preco.toString()) - parseFloat(product.custo?.toString() || '0')) / parseFloat(product.preco.toString())) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </button>
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