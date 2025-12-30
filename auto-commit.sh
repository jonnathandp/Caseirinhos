#!/bin/bash

# Script para commit automático
# Executa: ./auto-commit.sh "mensagem do commit"

# Verificar se foi fornecida uma mensagem
if [ -z "$1" ]; then
    # Se não foi fornecida mensagem, usar mensagem padrão com timestamp
    MENSAGEM="auto: atualizações $(date '+%d/%m/%Y %H:%M:%S')"
else
    MENSAGEM="$1"
fi

echo "🔄 Iniciando commit automático..."
echo "📝 Mensagem: $MENSAGEM"

# Adicionar todas as mudanças
git add .

# Verificar se há mudanças para commitar
if git diff --staged --quiet; then
    echo "✅ Nenhuma mudança para commitar"
    exit 0
fi

# Fazer commit
git commit -m "$MENSAGEM"

# Verificar se o commit foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Commit realizado com sucesso"
    
    # Fazer push
    echo "🚀 Enviando para o GitHub..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "✅ Push realizado com sucesso!"
        echo "🎉 Todas as mudanças foram enviadas para o GitHub"
    else
        echo "❌ Erro ao fazer push"
        exit 1
    fi
else
    echo "❌ Erro ao fazer commit"
    exit 1
fi