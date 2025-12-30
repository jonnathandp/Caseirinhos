'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Email ou senha inválidos.'
      case 'Configuration':
        return 'Erro de configuração do servidor.'
      case 'AccessDenied':
        return 'Acesso negado.'
      case 'Verification':
        return 'Erro de verificação.'
      default:
        return 'Ocorreu um erro durante o login.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-2xl">⚠️</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Erro de Autenticação
        </h1>

        <p className="text-gray-600 mb-8">
          {getErrorMessage(error)}
        </p>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            Tentar Novamente
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Página Inicial
          </Link>
        </div>

        {error && (
          <div className="mt-6 text-xs text-gray-500">
            Código do erro: {error}
          </div>
        )}
      </div>
    </div>
  )
}