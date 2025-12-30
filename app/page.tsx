import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    // Tentar importar dinamicamente para evitar erros de build
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    
    if (session) {
      redirect('/dashboard')
    }
  } catch (error) {
    // Se der erro na verificação de sessão, continua para o login
    console.log('Erro na verificação de sessão:', error)
  }
  
  // Se não estiver logado, vai para login
  redirect('/auth/signin')
}