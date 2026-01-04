'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/hooks/useSidebar'
import { Tooltip } from '@/components/ui/Tooltip'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BoxIcon,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Estoque', href: '/estoque', icon: BoxIcon },
  { name: 'Vendas', href: '/vendas', icon: TrendingUp },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export default function AppLayout({ children }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { sidebarOpen, isMobile, toggleSidebar } = useSidebar()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="flex min-h-screen bg-gray-50 w-full overflow-hidden">
      {/* Overlay para mobile quando sidebar está aberta */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - sempre visível em desktop, móvel apenas quando aberta */}
      <div className={`
        ${isMobile ? 'fixed' : 'fixed'} inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMobile 
          ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
          : 'translate-x-0'
        }
      `}>
        <div className="flex flex-col h-full">
          {/* Header da sidebar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🍰</span>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Caseirinhos</h1>
                <p className="text-xs text-gray-500">Delicious</p>
              </div>
            </div>
            {/* Só mostra o botão X em mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={isMobile ? toggleSidebar : undefined}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </a>
              )
            })}
          </nav>

          {/* User info e logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-primary-700">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header móvel - só aparece em mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <span className="text-lg mr-2">🍰</span>
              <h1 className="text-base font-semibold text-gray-900">Caseirinhos</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`
        flex-1 min-h-screen
        ${isMobile ? 'pt-14' : 'ml-64'}
      `}>
        <main className="w-full h-full">
          {children}
        </main>
      </div>
    </div>
  )
}