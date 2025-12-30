export const dynamic = 'force-dynamic'

export default function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard Simples
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Sistema Funcionando</h2>
              <p className="text-gray-600">
                O sistema básico está operacional. O dashboard completo será carregado assim que o banco estiver totalmente configurado.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Próximos Passos</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Verificar conexão com banco</li>
                <li>• Carregar dados iniciais</li>
                <li>• Ativar funcionalidades completas</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/setup" 
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Configurar Sistema Completo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}