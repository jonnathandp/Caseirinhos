import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Durante o build, simplesmente redireciona para signin
  if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
    redirect('/auth/signin')
  }

  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
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