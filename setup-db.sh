#!/bin/bash
# Script para configurar o banco de dados no Railway

echo "🗄️ Configurando banco de dados..."

# Gerar o cliente Prisma
echo "📦 Gerando cliente Prisma..."
npx prisma generate

# Fazer push do schema para o banco
echo "🚀 Criando tabelas no banco..."
npx prisma db push --force-reset

# Popular o banco com dados iniciais
echo "🌱 Populando banco com dados iniciais..."
npx tsx prisma/seed.ts

echo "✅ Banco configurado com sucesso!"