import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { hash, compare } from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    
    // Validar dados obrigatórios
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 })
    }

    // Validar tamanho da nova senha
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Em um sistema real, você verificaria a senha atual no banco:
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id }
    // })
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    // }

    // const isCurrentPasswordValid = await compare(currentPassword, user.password)
    // if (!isCurrentPasswordValid) {
    //   return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    // }

    // const hashedNewPassword = await hash(newPassword, 12)
    
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { password: hashedNewPassword }
    // })

    // Por enquanto, simulamos a alteração
    console.log('Alteração de senha para usuário:', session.user?.email)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Senha alterada com sucesso' 
    })
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}