'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  Filter,
  MapPin,
  Phone,
  User,
  Clock,
  Calendar
} from 'lucide-react'

interface Product {
  id: string
  nome: string
  categoria: string
  preco: number
  descricao?: string
  estoque?: {
    quantidade: number
    quantidadeMinima: number
  }
}

interface CartItem {
  product: Product
  quantidade: number
}

interface CustomerData {
  nome: string
  telefone: string
  endereco: string
  observacoes: string
  tipoEntrega: 'retirada' | 'delivery'
  dataEntrega: string
}

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData>({
    nome: '',
    telefone: '',
    endereco: '',
    observacoes: '',
    tipoEntrega: 'retirada',
    dataEntrega: ''
  })

  useEffect(() => {
    loadProducts()
    loadCartFromStorage()
  }, [])

  useEffect(() => {
    saveCartToStorage()
  }, [cart])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((product: Product) => product.estoque && product.estoque.quantidade > 0))
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('caseirinhos_cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const saveCartToStorage = () => {
    localStorage.setItem('caseirinhos_cart', JSON.stringify(cart))
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantidade: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item.product.id === productId)
    
    if (existingItem && existingItem.quantidade > 1) {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      ))
    } else {
      setCart(cart.filter(item => item.product.id !== productId))
    }
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('caseirinhos_cart')
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.preco * item.quantidade), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantidade, 0)
  }

  const getCategories = () => {
    const categories = products.map(product => product.categoria)
    return ['todos', ...Array.from(new Set(categories))]
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'todos' || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho')
      return
    }

    if (!customerData.nome || !customerData.telefone) {
      alert('Preencha nome e telefone')
      return
    }

    if (customerData.tipoEntrega === 'delivery' && !customerData.endereco) {
      alert('Preencha o endereço para delivery')
      return
    }

    try {
      const orderData = {
        clienteNome: customerData.nome,
        total: getTotalPrice(),
        tipoEntrega: customerData.tipoEntrega,
        endereco: customerData.tipoEntrega === 'delivery' ? customerData.endereco : null,
        dataEntrega: customerData.dataEntrega || null,
        observacoes: customerData.observacoes,
        status: 'PENDENTE',
        items: cart.map(item => ({
          productId: item.product.id,
          produtoNome: item.product.nome,
          quantidade: item.quantidade,
          precoUnitario: item.product.preco,
          subtotal: item.product.preco * item.quantidade
        }))
      }

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        alert('Pedido realizado com sucesso! Em breve entraremos em contato.')
        clearCart()
        setShowCheckout(false)
        setCustomerData({
          nome: '',
          telefone: '',
          endereco: '',
          observacoes: '',
          tipoEntrega: 'retirada',
          dataEntrega: ''
        })
      } else {
        alert('Erro ao enviar pedido. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      alert('Erro ao enviar pedido. Tente novamente.')
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">Caseirinhos Delicious</h1>
              <p className="text-gray-600">Doces artesanais e queijos especiais</p>
            </div>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Carrinho</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'todos' ? 'Todas as categorias' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.categoria}</p>
                  {product.descricao && (
                    <p className="text-sm text-gray-500 mb-3">{product.descricao}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      R$ {Number(product.preco).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Estoque: {product.estoque?.quantidade || 0}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                      disabled={!cart.find(item => item.product.id === product.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-8 text-center font-medium">
                      {cart.find(item => item.product.id === product.id)?.quantidade || 0}
                    </span>
                    
                    <button
                      onClick={() => addToCart(product)}
                      className="p-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      disabled={!product.estoque || product.estoque.quantidade <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Carrinho</h3>
                <button 
                  onClick={() => setShowCart(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h4 className="font-medium">{item.product.nome}</h4>
                        <p className="text-sm text-gray-600">
                          R$ {Number(item.product.preco).toFixed(2)} x {item.quantidade}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 bg-gray-200 rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span>{item.quantidade}</span>
                        <button
                          onClick={() => addToCart(item.product)}
                          className="p-1 bg-primary-600 text-white rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      setShowCart(false)
                      setShowCheckout(true)
                    }}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Finalizar Pedido
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Limpar Carrinho
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Finalizar Pedido</h3>
                <button 
                  onClick={() => setShowCheckout(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitOrder(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={customerData.nome}
                    onChange={(e) => setCustomerData({...customerData, nome: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    required
                    value={customerData.telefone}
                    onChange={(e) => setCustomerData({...customerData, telefone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de entrega
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomerData({...customerData, tipoEntrega: 'retirada'})}
                    className={`p-3 border rounded-md text-center transition-colors ${
                      customerData.tipoEntrega === 'retirada'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Retirada
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerData({...customerData, tipoEntrega: 'delivery'})}
                    className={`p-3 border rounded-md text-center transition-colors ${
                      customerData.tipoEntrega === 'delivery'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {customerData.tipoEntrega === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço de entrega *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      required={customerData.tipoEntrega === 'delivery'}
                      value={customerData.endereco}
                      onChange={(e) => setCustomerData({...customerData, endereco: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de entrega (opcional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    min={minDate}
                    value={customerData.dataEntrega}
                    onChange={(e) => setCustomerData({...customerData, dataEntrega: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  rows={3}
                  value={customerData.observacoes}
                  onChange={(e) => setCustomerData({...customerData, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Observações sobre o pedido..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Resumo do pedido:</h4>
                <div className="space-y-1 text-sm">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between">
                      <span>{item.quantidade}x {item.product.nome}</span>
                      <span>R$ {(item.product.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2 font-bold">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Confirmar Pedido
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}