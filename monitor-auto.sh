#!/bin/bash

echo "🤖 MONITORAMENTO AUTOMÁTICO ATIVADO"
echo "👀 Detectando mudanças em tempo real..."
echo "🛑 Para parar: Ctrl+C"
echo ""

# Função para fazer commit
fazer_commit() {
    echo "🔄 $(date '+%H:%M:%S') - Mudanças detectadas!"
    
    git add . 2>/dev/null
    
    # Verificar se há mudanças
    if git diff --staged --quiet; then
        return
    fi
    
    # Commit automático
    TIMESTAMP=$(date '+%d/%m/%Y %H:%M:%S')
    git commit -m "auto: mudanças detectadas em $TIMESTAMP" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit realizado"
        git push 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Push enviado para GitHub"
        fi
    fi
    echo ""
}

# Monitoramento contínuo
while true; do
    sleep 3
    
    # Verificar mudanças
    git add . 2>/dev/null
    STATUS=$(git status --porcelain 2>/dev/null)
    
    if [ -n "$STATUS" ]; then
        fazer_commit
    fi
done