# 🗄️ Setup do Banco de Dados

Para configurar o banco PostgreSQL no Railway, execute um dos comandos abaixo:

## 🚀 Opção 1: Usando npm (Recomendado)
```bash
npm run db:setup
```

## 🐚 Opção 2: Usando script bash
```bash
chmod +x setup-db.sh
./setup-db.sh
```

## 🔧 Opção 3: Comandos individuais
```bash
# 1. Gerar cliente Prisma
npx prisma generate

# 2. Criar tabelas no banco
npx prisma db push --force-reset

# 3. Popular com dados iniciais
npx tsx prisma/seed.ts
```

## 📝 O que será criado:

### 👥 **Usuários**
- Admin padrão: admin@caseirinhos.com / admin123

### 🧁 **Produtos** (8 produtos)
- Bolo de Chocolate
- Brigadeiro Gourmet  
- Cupcake Red Velvet
- Torta de Limão
- Coxinha de Frango
- Pão de Açúcar
- Suco Natural
- Bolo de Cenoura

### 👤 **Clientes** (5 clientes)
- Maria Silva
- João Santos
- Ana Costa
- Carlos Oliveira
- Fernanda Lima

### 📦 **Estoque**
- Controle automático para todos os produtos

### 🥄 **Ingredientes** (6 ingredientes)
- Farinha de Trigo
- Açúcar Cristal
- Chocolate em Pó
- Ovos
- Leite Integral
- Manteiga

---

## 🔗 Railway Setup

1. **No Railway Dashboard**, acesse o projeto
2. **Variables**: Certifique-se que as variáveis estão configuradas:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://caseirinhos.up.railway.app
   ```

3. **Deploy**: Faça o commit e push
4. **Execute**: No Railway, vá em "Settings" > "Builds" e execute:
   ```bash
   npm run db:setup
   ```

Ou conecte via SSH e execute os comandos diretamente.

## ✅ Verificação

Após o setup, você pode:
- Acessar o sistema em: https://caseirinhos.up.railway.app
- Login com: admin@caseirinhos.com / admin123
- Ver tabelas no Railway: Dashboard > Database > Data

🎉 **Pronto! Seu sistema estará funcionando completamente!**