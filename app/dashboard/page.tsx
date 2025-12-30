import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardClient from './dashboard-client'
import AppLayout from '../../src/components/layout/AppLayout'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      redirect('/auth/signin')
    }
    
    return (
      <AppLayout>
        <DashboardClient session={session} />
      </AppLayout>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    
    // Fallback: redirecionar para uma página simples
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl">🍰</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Bem-vindo ao Caseirinhos Delicious
            </h1>
            <p className="text-gray-600 mb-6">
              Sistema carregando... Caso persista o erro, o banco pode precisar ser configurado.
            </p>
            <a
              href="/setup"
              className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Configurar Sistema
            </a>
          </div>
        </div>
      </AppLayout>
    )
  }
}