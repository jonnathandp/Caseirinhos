'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const setupDatabase = async () => {
    setIsLoading(true)
    setStatus('Iniciando configuração do banco...')

    try {
      const response = await fetch('/api/setup-db', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setStatus('✅ Banco configurado com sucesso!')
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setStatus('❌ Erro: ' + data.error)
      }
    } catch (error: any) {
      setStatus('❌ Erro: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-2xl">🍰</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Configurar Banco de Dados
        </h1>

        <p className="text-gray-600 mb-8">
          O banco de dados precisa ser configurado antes de usar o sistema.
          Clique no botão abaixo para criar as tabelas e dados iniciais.
        </p>

        {!success && (
          <button
            onClick={setupDatabase}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Configurando...' : 'Configurar Banco'}
          </button>
        )}

        {status && (
          <div className={`mt-6 p-4 rounded-lg ${
            success 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : isLoading
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {status}
          </div>
        )}

        {success && (
          <div className="mt-6 text-sm text-gray-600">
            Redirecionando para o login em 2 segundos...
          </div>
        )}
      </div>
    </div>
  )
}