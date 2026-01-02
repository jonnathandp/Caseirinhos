'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Home,
  ArrowLeft
} from 'lucide-react'

interface OrderStatus {
  id: string
  numero: string
  clienteNome: string
  total: number
  formaPagamento: string
  tipoEntrega: string
  endereco?: string
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO'
  dataPedido: string
  dataEntrega?: string
  observacoes?: string
  items: Array<{
    produto: string
    quantidade: number
    preco: number
  }>
}

export default function AcompanharPedido() {
  const params = useParams()
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const numero = params?.numero as string

  useEffect(() => {
    if (numero) {
      loadOrderStatus()
      // Auto-refresh a cada 30 segundos
      const interval = setInterval(loadOrderStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [numero])

  const loadOrderStatus = async () => {
    try {
      setError('')
      const response = await fetch(`/api/acompanhar/${numero}`)
      
      if (!response.ok) {
        throw new Error('Pedido não encontrado')
      }
      
      const orderData = await response.json()
      setOrder(orderData)
    } catch (error) {
      console.error('Erro ao carregar pedido:', error)
      setError('Pedido não encontrado. Verifique o número e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      PENDENTE: {
        text: 'Pedido Recebido',
        description: 'Aguardando confirmação',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: Clock
      },
      PREPARANDO: {
        text: 'Preparando',
        description: 'Seu pedido está sendo preparado',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: Package
      },
      PRONTO: {
        text: 'Pronto',
        description: 'Pedido pronto para retirada/entrega',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle
      },
      ENTREGUE: {
        text: 'Entregue',
        description: 'Pedido entregue com sucesso',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: CheckCircle
      },
      CANCELADO: {
        text: 'Cancelado',
        description: 'Pedido cancelado',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: AlertCircle
      }
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDENTE
  }

  const getProgressPercentage = (status: string) => {
    const progress = {
      PENDENTE: 25,
      PREPARANDO: 50,
      PRONTO: 75,
      ENTREGUE: 100,
      CANCELADO: 0
    }
    return progress[status as keyof typeof progress] || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <button
              onClick={() => window.location.href = '/loja'}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Nova Compra
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon
  const progressPercentage = getProgressPercentage(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acompanhar Pedido</h1>
              <p className="text-gray-600">Caseirinhos Delicious</p>
            </div>
            <button
              onClick={loadOrderStatus}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Atualizar status"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusInfo.bgColor} mb-4`}>
              <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Pedido #{order.numero}</h2>
            <p className={`text-lg font-medium ${statusInfo.color} mb-1`}>{statusInfo.text}</p>
            <p className="text-sm text-gray-600">{statusInfo.description}</p>
          </div>

          {/* Progress Bar */}
          {order.status !== 'CANCELADO' && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Recebido</span>
                <span>Preparando</span>
                <span>Pronto</span>
                <span>Entregue</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-green-600">R$ {Number(order.total).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Pagamento</p>
                <p className="font-semibold">{order.formaPagamento}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {order.tipoEntrega === 'delivery' ? (
                <Truck className="h-5 w-5 text-blue-600" />
              ) : (
                <Package className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <p className="text-sm text-gray-600">Entrega</p>
                <p className="font-semibold">{order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retirada'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Pedido feito em</p>
                <p className="font-semibold">
                  {new Date(order.dataPedido).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {order.endereco && (
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Endereço de entrega</p>
                  <p className="font-medium">{order.endereco}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium">{item.quantidade}x {item.produto}</p>
                  <p className="text-sm text-gray-600">R$ {Number(item.preco).toFixed(2)} cada</p>
                </div>
                <p className="font-semibold text-primary-600">
                  R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total:</p>
                <p className="text-xl font-bold text-primary-600">R$ {Number(order.total).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {order.observacoes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{order.observacoes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/loja'}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Package className="h-5 w-5" />
            Fazer Novo Pedido
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Meu Pedido - Caseirinhos',
                  text: `Acompanhe meu pedido #${order.numero}`,
                  url: window.location.href
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copiado! 📋')
              }
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Compartilhar
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            Esta página é atualizada automaticamente a cada 30 segundos
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Para dúvidas, entre em contato conosco
          </p>
        </div>
      </div>
    </div>
  )
}