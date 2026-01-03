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
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay para mobile quando sidebar está aberta */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg sidebar-transition
        ${sidebarOpen ? 'w-64' : 'w-16'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo e botão toggle */}
          <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200">
            <div className={`flex items-center sidebar-transition ${!sidebarOpen && 'opacity-0'}`}>
              <span className="text-2xl mr-2">🍰</span>
              <div className={`${!sidebarOpen && 'hidden'}`}>
                <h1 className="text-lg font-semibold text-gray-900">Caseirinhos</h1>
                <p className="text-xs text-gray-500">Delicious</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sidebar-transition"
              title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto sidebar-scrollbar">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Tooltip 
                  key={item.name} 
                  content={item.name} 
                  show={!sidebarOpen && !isMobile}
                >
                  <a
                    href={item.href}
                    className={`sidebar-item group ${
                      isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    <span className={`ml-3 sidebar-transition ${
                      !sidebarOpen ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                    }`}>
                      {item.name}
                    </span>
                  </a>
                </Tooltip>
              )
            })}
          </nav>

          {/* User info e logout */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1 min-w-0 sidebar-transition">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded sidebar-transition"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header móvel */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sidebar-transition"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <span className="text-xl mr-2">🍰</span>
              <h1 className="text-lg font-semibold text-gray-900">Caseirinhos</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sidebar-transition"
                aria-label="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`
        flex-1 sidebar-transition
        ${!isMobile ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'}
        ${isMobile ? 'pt-16' : 'pt-0'}
      `}>
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}