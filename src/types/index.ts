// Tipos do sistema
export interface User {
  id: string
  nome: string
  email: string
  tipo: 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE'
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  nome: string
  categoria: string
  preco: number
  custo: number
  descricao?: string
  imagem?: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  nome: string
  email?: string
  telefone?: string
  endereco?: string
  dataNascimento?: Date
  pontosFidelidade: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  clienteId?: string
  clienteNome: string
  total: number
  status: 'PENDENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO'
  tipoEntrega: string
  endereco?: string
  dataPedido: Date
  dataEntrega?: Date
  observacoes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  produtoNome: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export interface Stock {
  id: string
  productId: string
  produtoNome: string
  quantidade: number
  quantidadeMinima: number
  unidade: string
  updatedAt: Date
}

export interface Sale {
  id: string
  orderId: string
  productId: string
  produtoNome: string
  quantidade: number
  precoUnitario: number
  subtotal: number
  dataVenda: Date
}

export interface DashboardStats {
  vendas: {
    hoje: number
    semana: number
    mes: number
  }
  pedidos: {
    total: number
    pendentes: number
    prontos: number
  }
  produtos: {
    total: number
    estoqueBaixo: number
  }
  clientes: {
    total: number
    novos: number
  }
}