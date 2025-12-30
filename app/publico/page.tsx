import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Clock, MapPin, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Caseirinhos Delicious - Doces Artesanais',
  description: 'Doces artesanais e queijos especiais. Faça seu pedido online!',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-primary-600">Caseirinhos</span> Delicious
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Doces artesanais e queijos especiais feitos com carinho e ingredientes selecionados
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg"
              >
                <ShoppingBag className="h-6 w-6" />
                Fazer Pedido Online
              </Link>
              
              <a
                href="tel:+5511999999999"
                className="inline-flex items-center gap-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                <Phone className="h-6 w-6" />
                Ligar Agora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher nossos produtos?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Produtos Artesanais</h3>
              <p className="text-gray-600">
                Todos nossos doces e queijos são feitos artesanalmente com receitas especiais e ingredientes de primeira qualidade.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Entrega Rápida</h3>
              <p className="text-gray-600">
                Oferecemos opções de retirada na loja ou entrega em domicílio para sua maior comodidade.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Localização Privilegiada</h3>
              <p className="text-gray-600">
                Estamos localizados em uma região de fácil acesso, com estacionamento disponível.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para saborear?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Navegue por nosso catálogo online e faça seu pedido agora mesmo!
          </p>
          
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg"
          >
            <ShoppingBag className="h-6 w-6" />
            Ver Produtos Disponíveis
          </Link>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Horário de Funcionamento</h3>
              <p className="text-gray-600">
                Segunda à Sexta: 8h às 18h<br />
                Sábado: 8h às 14h<br />
                Domingo: Fechado
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contato</h3>
              <p className="text-gray-600">
                Telefone: (11) 99999-9999<br />
                WhatsApp: (11) 99999-9999<br />
                Email: contato@caseirinhos.com.br
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Localização</h3>
              <p className="text-gray-600">
                Rua das Delícias, 123<br />
                Centro - São Paulo/SP<br />
                CEP: 01000-000
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-primary-400 mb-2">Caseirinhos Delicious</h3>
          <p className="text-gray-400">
            © 2025 Caseirinhos Delicious. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}