# 🍰 Sistema Caseirinhos Delicious

Sistema completo de gestão para doceria com PostgreSQL e deploy no Railway.

![Sistema Caseirinhos](https://img.shields.io/badge/Sistema-Caseirinhos%20Delicious-orange)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Railway](https://img.shields.io/badge/Deploy-Railway-purple)

## 🚀 Funcionalidades Principais

### 📊 **Dashboard Executivo**
- Métricas em tempo real
- Gráficos de vendas
- Alertas de estoque
- KPIs financeiros

### 🧁 **Gestão Completa**
- **Produtos**: Cadastro, categorias, preços e custos
- **Pedidos**: Sistema completo com status e delivery
- **Clientes**: Base completa com histórico
- **Estoque**: Controle automático com alertas
- **Ingredientes**: Gestão de matéria-prima
- **Relatórios**: Análises detalhadas
- **Fidelidade**: Programa de pontos automático

### 🌐 **Sistema Online**
- Interface responsiva
- Sistema público de pedidos
- Banco PostgreSQL
- Deploy automático no Railway

## 🛠️ Tecnologias

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma
- JWT Authentication
- bcryptjs

**Frontend:**
- React 18
- Tailwind CSS
- React Query
- React Router

**Deploy:**
- Railway
- Docker
- GitHub Actions

## ⚡ Início Rápido

### 1. Clone o repositório
```bash
git clone <repository-url>
cd caseirinhos-system
```

### 2. Instale dependências
```bash
npm run install-all
```

### 3. Configurar Banco de Dados
Siga o guia: [`docs/POSTGRESQL_SETUP.md`](docs/POSTGRESQL_SETUP.md)

### 4. Configure variáveis de ambiente
```bash
cp backend/.env.example backend/.env
# Edite o arquivo .env com suas configurações
```

### 5. Execute localmente
```bash
npm run dev
```

Acesse: http://localhost:3000

## 🚀 Deploy no Railway

Siga o guia completo: [`docs/RAILWAY_DEPLOY.md`](docs/RAILWAY_DEPLOY.md)

### Deploy Rápido:
1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático!

## 📊 Estrutura do Projeto

```
caseirinhos-system/
├── backend/                 # API Node.js
│   ├── routes/             # Rotas da API
│   ├── config/             # Configurações
│   └── server.js           # Servidor principal
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   └── contexts/       # Contextos React
├── docs/                   # Documentação
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run server          # Apenas backend
npm run client          # Apenas frontend

# Produção
npm run build           # Build do frontend
npm start              # Servidor de produção

# Instalação
npm run install-all    # Instala todas as dependências
```

## 📱 Funcionalidades por Usuário

### 👨‍💼 **Administrador**
- ✅ Acesso completo ao sistema
- ✅ Gestão de usuários
- ✅ Configurações avançadas
- ✅ Relatórios financeiros

### 👩‍🍳 **Funcionário**
- ✅ Gestão de produtos e pedidos
- ✅ Controle de estoque
- ✅ Atendimento ao cliente
- ✅ Relatórios operacionais

### 👤 **Cliente**
- ✅ Sistema público de pedidos
- ✅ Acompanhamento de status
- ✅ Programa de fidelidade
- ✅ Histórico de compras

## 🎯 Casos de Uso

### 🏪 **Para Doceiras**
- Controle completo do negócio
- Gestão de receitas e custos
- Programa de fidelidade automático
- Relatórios para tomada de decisão

### 🏢 **Para Pequenas Empresas**
- Sistema profissional
- Baixo custo operacional
- Escalabilidade automática
- Backup seguro na nuvem

### 📱 **Para Clientes**
- Pedidos online fáceis
- Acompanhamento em tempo real
- Programa de pontos
- Histórico completo

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Senhas criptografadas
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ HTTPS automático

## 📈 Métricas e Analytics

- 📊 Dashboard executivo
- 📈 Gráficos de vendas
- 💰 Análise financeira
- 👥 Comportamento de clientes
- 📦 Controle de estoque
- 🎯 KPIs personalizados

## 🌟 Diferenciais

### 💾 **Google Sheets como Database**
- ✅ Backup automático
- ✅ Acesso via planilha
- ✅ Colaboração em tempo real
- ✅ Sem custos de database

### 🚀 **Deploy Simplificado**
- ✅ Railway com 1 clique
- ✅ HTTPS automático
- ✅ Escalabilidade automática
- ✅ Monitoramento incluído

### 🎨 **Interface Moderna**
- ✅ Design responsivo
- ✅ UX otimizada
- ✅ Componentes reutilizáveis
- ✅ Acessibilidade

## 📞 Suporte

- 📖 **Documentação**: [`docs/`](docs/)
- 🐛 **Issues**: Abra uma issue no GitHub
- 💬 **Discussões**: Use as Discussions do GitHub

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎉 Agradecimentos

- Google Sheets API
- Railway Platform
- React Community
- Tailwind CSS
- Lucide Icons

---

**Desenvolvido com ❤️ para transformar negócios de doceria**

[🚀 Deploy no Railway](https://railway.app) | [📋 PostgreSQL Setup](docs/POSTGRESQL_SETUP.md) | [📚 Documentação Completa](docs/README.md)