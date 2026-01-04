#!/bin/bash

echo "🔍 Verificando configuração do banco..."

# Verificar se existe arquivo .env
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Crie um arquivo .env com DATABASE_URL"
    exit 1
fi

# Verificar DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL não encontrado no .env"
    echo "📝 Adicione DATABASE_URL=sua_conexao_postgres"
    exit 1
fi

echo "✅ Arquivo .env encontrado"

# Verificar se Prisma está configurado
echo "🔄 Gerando cliente Prisma..."
npx prisma generate

echo "🔄 Aplicando migrações..."
npx prisma migrate deploy

echo "🔍 Verificando tabelas..."
npx prisma db seed --preview-feature || echo "⚠️  Seed não configurado"

echo "📊 Status do banco:"
npx prisma db show

echo ""
echo "✅ Configuração do banco verificada!"
echo "🚀 Agora teste a aplicação!"