#!/bin/bash

echo "🚀 Configurando banco de dados Railway..."

# Verificar se existe DATABASE_URL
if [ -z "$DATABASE_URL" ] && [ -f .env ]; then
    echo "📁 Carregando variáveis do .env"
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrado!"
    echo "Configure no Railway ou arquivo .env"
    exit 1
fi

echo "✅ DATABASE_URL configurado"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Reset do banco (CUIDADO!)
echo "⚠️  ATENÇÃO: Isso vai limpar todos os dados existentes!"
read -p "Deseja continuar? (y/N): " confirm
if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "🔄 Aplicando reset do banco..."
    npx prisma db push --force-reset
else
    echo "🔄 Aplicando migrações sem reset..."
    npx prisma db push
fi

# Executar seed se existir
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Executando seed..."
    npx prisma db seed
fi

echo ""
echo "✅ Banco de dados configurado com sucesso!"
echo "🎯 Tabelas criadas:"
echo "   - users (usuários)"
echo "   - configurations (configurações)"
echo "   - products (produtos)" 
echo "   - orders (pedidos)"
echo "   - sales (vendas)"
echo "   - stock (estoque)"
echo ""
echo "🚀 Sistema pronto para usar com Railway!"

# Mostrar status do banco
echo "📊 Status do banco:"
npx prisma db show || echo "Erro ao mostrar status"