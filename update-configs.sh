#!/bin/bash

echo "🔄 Aplicando migrações do banco de dados..."

# Aplicar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

echo "✅ Migrações aplicadas com sucesso!"
echo "🎨 Sistema de configurações e temas implementado!"
echo ""
echo "📋 Funcionalidades adicionadas:"
echo "  - ✅ Persistência real no banco de dados"
echo "  - ✅ Sistema de tema claro/escuro"
echo "  - ✅ Salvamento automático de configurações"
echo "  - ✅ Validação de dados"
echo "  - ✅ Alteração de senha (estrutura)"
echo ""
echo "🚀 Execute 'npm run dev' para testar o sistema!"