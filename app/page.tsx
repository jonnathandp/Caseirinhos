import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  try {
    // Verificar se o banco está configurado
    await prisma.user.findFirst()
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      redirect('/auth/signin')
    }
    
    redirect('/dashboard')
  } catch (error) {
    // Se der erro, provavelmente o banco não está configurado
    console.log('Banco não configurado, redirecionando para setup...')
    redirect('/setup')
  }
}