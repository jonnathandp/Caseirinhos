#!/bin/bash

echo "🧪 Testando API de Configurações..."

# Testar GET
echo "📥 Testando GET /api/configuracoes:"
curl -X GET http://localhost:3000/api/configuracoes \
  -H "Content-Type: application/json" \
  -v

echo ""
echo "📤 Testando POST /api/configuracoes:"

# Testar POST
curl -X POST http://localhost:3000/api/configuracoes \
  -H "Content-Type: application/json" \
  -d '{
    "loja": {
      "nome": "Caseirinhos Test",
      "endereco": "Rua Teste, 123",
      "telefone": "(11) 98765-4321",
      "email": "teste@caseirinhos.com",
      "cnpj": "11.222.333/0001-44"
    },
    "usuario": {
      "nome": "Usuário Teste",
      "email": "usuario@teste.com",
      "telefone": "(11) 91234-5678"
    },
    "notificacoes": {
      "estoqueMinimo": false,
      "novosPedidos": true,
      "emailVendas": true
    },
    "sistema": {
      "tema": "escuro",
      "moeda": "USD",
      "fuso": "America/New_York"
    }
  }' \
  -v

echo ""
echo "✅ Teste concluído! Verifique os logs do servidor."