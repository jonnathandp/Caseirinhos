const { execSync } = require('child_process')

async function setupDatabase() {
  console.log('🗄️ Configurando banco de dados...')
  
  try {
    // Gerar cliente Prisma
    console.log('📦 Gerando cliente Prisma...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Fazer push do schema
    console.log('🚀 Criando tabelas no banco...')
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
    
    // Popular com dados
    console.log('🌱 Populando banco com dados iniciais...')
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })
    
    console.log('✅ Banco configurado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message)
    process.exit(1)
  }
}

setupDatabase()