# 🧁 Caseirinhos Delicious - Sistema de Gestão para Doceria

Sistema completo de gestão para doceria desenvolvido com **Next.js 14**, **TypeScript**, **Prisma ORM** e **PostgreSQL**.

## 🚀 Funcionalidades

### 👥 Sistema de Usuários
- **Administrador**: Acesso completo ao sistema
- **Funcionário**: Gestão de produtos, pedidos, clientes e estoque
- **Cliente**: Visualização de pedidos e perfil

### 📦 Gestão de Produtos
- ✅ Cadastro completo de produtos com imagens
- ✅ Categorização (Bolos, Tortas, Doces, etc.)
- ✅ Controle de preços e status (ativo/inativo)
- ✅ Sistema de busca e filtros avançados

### 🛒 Gestão de Pedidos
- ✅ Criação e acompanhamento de pedidos
- ✅ Status: Pendente → Confirmado → Preparando → Pronto → Entregue
- ✅ Cálculo automático de totais
- ✅ Controle de estoque automático

### 👤 Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Sistema de pontos de fidelidade
- ✅ Histórico de pedidos e compras

### 📊 Controle de Estoque
- ✅ Gestão de estoque por produto
- ✅ Alertas de estoque baixo
- ✅ Controle de ingredientes com validade

### 🚚 Sistema de Delivery
- ✅ Agendamento de entregas
- ✅ Controle de endereços
- ✅ Status de entrega

### 📈 Relatórios e Dashboard
- ✅ Dashboard com estatísticas em tempo real
- ✅ Gráficos de vendas e pedidos
- ✅ Produtos mais vendidos
- ✅ Relatórios financeiros

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Hook Form** - Gerenciamento de formulários
- **Chart.js** - Gráficos e visualizações
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - API RESTful
- **Prisma ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação completa
- **Zod** - Validação de schemas

### Infraestrutura
- **Railway** - Deploy e hospedagem
- **Vercel** - Deploy do frontend (alternativo)

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd caseirinhos-nextjs
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/caseirinhos_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"

# Opcional: Para produção
RAILWAY_DATABASE_URL="postgresql://..."
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# Popular com dados de exemplo
npx prisma db seed
```

### 5. Execute o projeto
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 👤 Contas Demo

### Administrador
- **Email**: admin@caseirinhos.com
- **Senha**: admin123
- **Acesso**: Completo ao sistema

### Funcionário
- **Email**: funcionario@caseirinhos.com
- **Senha**: func123
- **Acesso**: Gestão operacional

### Cliente
- **Email**: cliente@caseirinhos.com
- **Senha**: cliente123
- **Acesso**: Visualização de pedidos

## 📁 Estrutura do Projeto

```
caseirinhos-nextjs/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts               # Dados de exemplo
├── src/
│   ├── app/                  # App Router do Next.js
│   │   ├── api/             # API Routes
│   │   ├── dashboard/       # Páginas do dashboard
│   │   └── page.tsx         # Página de login
│   ├── components/          # Componentes React
│   │   ├── auth/           # Componentes de autenticação
│   │   ├── dashboard/      # Componentes do dashboard
│   │   ├── layout/         # Layout e navegação
│   │   └── products/       # Componentes de produtos
│   ├── lib/                # Utilitários e configurações
│   │   ├── auth.ts         # Configuração NextAuth
│   │   ├── prisma.ts       # Cliente Prisma
│   │   └── utils.ts        # Funções utilitárias
│   └── types/              # Definições TypeScript
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint

# Prisma
npm run db:generate    # Gerar cliente
npm run db:push       # Aplicar mudanças
npm run db:seed       # Popular dados
npm run db:studio     # Interface visual
```

## 🚀 Deploy

### Railway (Recomendado)
1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. O deploy será automático

### Vercel
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Configure um banco PostgreSQL (Supabase, PlanetScale, etc.)

## 📊 Funcionalidades Detalhadas

### Dashboard
- Estatísticas em tempo real
- Gráficos de vendas por período
- Produtos mais vendidos
- Pedidos recentes
- Alertas de estoque

### Gestão de Produtos
- CRUD completo
- Upload de imagens
- Categorização
- Controle de estoque
- Filtros avançados

### Gestão de Pedidos
- Fluxo completo de pedidos
- Controle de status
- Cálculos automáticos
- Histórico detalhado

### Sistema de Fidelidade
- Pontos por compra
- Recompensas automáticas
- Histórico de pontos

## 🔒 Segurança

- Autenticação JWT com NextAuth.js
- Autorização baseada em roles
- Validação de dados com Zod
- Sanitização de inputs
- HTTPS obrigatório em produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@caseirinhos.com
- 💬 WhatsApp: (11) 99999-9999

---

**Desenvolvido com ❤️ para a Caseirinhos Delicious**