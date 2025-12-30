#!/bin/bash

# Script para monitoramento automático de mudanças
# Executa: ./watch-changes.sh

echo "👀 Monitorando mudanças no projeto..."
echo "🛑 Para parar, pressione Ctrl+C"
echo ""

# Função para fazer commit das mudanças
fazer_commit() {
    echo "🔄 Mudanças detectadas! Fazendo commit..."
    
    # Adicionar todas as mudanças
    git add .
    
    # Verificar se há mudanças para commitar
    if git diff --staged --quiet; then
        return
    fi
    
    # Gerar mensagem de commit com timestamp
    TIMESTAMP=$(date '+%d/%m/%Y %H:%M:%S')
    MENSAGEM="auto: atualizações detectadas em $TIMESTAMP"
    
    # Fazer commit
    git commit -m "$MENSAGEM"
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit realizado"
        
        # Fazer push
        echo "🚀 Enviando para GitHub..."
        git push
        
        if [ $? -eq 0 ]; then
            echo "✅ Push realizado com sucesso!"
        else
            echo "❌ Erro ao fazer push"
        fi
    else
        echo "❌ Erro ao fazer commit"
    fi
    
    echo ""
}

# Verificar se inotifywait está disponível
if ! command -v inotifywait &> /dev/null; then
    echo "⚠️  inotifywait não encontrado. Usando monitoramento por polling..."
    
    # Monitoramento por polling (mais compatível)
    LAST_CHANGE=$(git log -1 --format="%H" 2>/dev/null || echo "")
    
    while true; do
        sleep 5
        
        # Verificar se há mudanças
        git add . 2>/dev/null
        CURRENT_STATUS=$(git status --porcelain 2>/dev/null)
        
        if [ -n "$CURRENT_STATUS" ]; then
            fazer_commit
            sleep 2
        fi
    done
else
    echo "✅ Usando inotifywait para monitoramento eficiente"
    
    # Monitoramento com inotifywait (mais eficiente)
    while true; do
        inotifywait -r -e modify,create,delete,move --exclude='\.git|node_modules|\.next|\.DS_Store' . 2>/dev/null
        sleep 2
        fazer_commit
        sleep 3
    done
fi