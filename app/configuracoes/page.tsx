'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Settings, User, Store, Bell, Shield, Palette, Save } from 'lucide-react'
import AppLayout from '../../src/components/layout/AppLayout'

interface ConfigData {
  loja: {
    nome: string
    endereco: string
    telefone: string
    email: string
    cnpj: string
  }
  usuario: {
    nome: string
    email: string
    telefone: string
  }
  notificacoes: {
    estoqueMinimo: boolean
    novosPedidos: boolean
    emailVendas: boolean
  }
  sistema: {
    tema: 'claro' | 'escuro'
    moeda: string
    fuso: string
  }
}

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('loja')
  const [configData, setConfigData] = useState<ConfigData>({
    loja: {
      nome: 'Caseirinhos Delicious',
      endereco: 'Rua das Delícias, 123',
      telefone: '(11) 99999-9999',
      email: 'contato@caseirinhos.com',
      cnpj: '12.345.678/0001-99'
    },
    usuario: {
      nome: session?.user?.name || '',
      email: session?.user?.email || '',
      telefone: ''
    },
    notificacoes: {
      estoqueMinimo: true,
      novosPedidos: true,
      emailVendas: false
    },
    sistema: {
      tema: 'claro',
      moeda: 'BRL',
      fuso: 'America/Sao_Paulo'
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (section: keyof ConfigData, field: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'loja', name: 'Loja', icon: Store },
    { id: 'usuario', name: 'Usuário', icon: User },
    { id: 'notificacoes', name: 'Notificações', icon: Bell },
    { id: 'sistema', name: 'Sistema', icon: Settings }
  ]

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
              <Settings className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-600">Gerencie as configurações do sistema</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'loja' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Informações da Loja</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                      <input
                        type="text"
                        value={configData.loja.nome}
                        onChange={(e) => updateConfig('loja', 'nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                      <input
                        type="text"
                        value={configData.loja.cnpj}
                        onChange={(e) => updateConfig('loja', 'cnpj', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <input
                        type="text"
                        value={configData.loja.endereco}
                        onChange={(e) => updateConfig('loja', 'endereco', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={configData.loja.telefone}
                        onChange={(e) => updateConfig('loja', 'telefone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={configData.loja.email}
                        onChange={(e) => updateConfig('loja', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'usuario' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Informações do Usuário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={configData.usuario.nome}
                        onChange={(e) => updateConfig('usuario', 'nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={configData.usuario.email}
                        onChange={(e) => updateConfig('usuario', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={configData.usuario.telefone}
                        onChange={(e) => updateConfig('usuario', 'telefone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Alterar Senha</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notificacoes' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Preferências de Notificação</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configData.notificacoes.estoqueMinimo}
                        onChange={(e) => updateConfig('notificacoes', 'estoqueMinimo', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notificar quando estoque estiver baixo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configData.notificacoes.novosPedidos}
                        onChange={(e) => updateConfig('notificacoes', 'novosPedidos', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notificar sobre novos pedidos</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configData.notificacoes.emailVendas}
                        onChange={(e) => updateConfig('notificacoes', 'emailVendas', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Receber relatórios de vendas por email</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'sistema' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configurações do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                      <select
                        value={configData.sistema.tema}
                        onChange={(e) => updateConfig('sistema', 'tema', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="claro">Claro</option>
                        <option value="escuro">Escuro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                      <select
                        value={configData.sistema.moeda}
                        onChange={(e) => updateConfig('sistema', 'moeda', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="BRL">Real (BRL)</option>
                        <option value="USD">Dólar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                      <select
                        value={configData.sistema.fuso}
                        onChange={(e) => updateConfig('sistema', 'fuso', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                        <option value="America/Manaus">Manaus (AMT)</option>
                        <option value="America/Recife">Recife (BRT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}