'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  Scale,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { NotificationBadge } from '@/components/notifications/notification-badge'
import { ProfileSearch } from '@/components/dashboard/profile-search'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { AddUdienzaForm } from '@/components/calendar/add-udienza-form'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Determina il tab attivo basandosi sulla pagina corrente
  const getCurrentActiveTab = () => {
    if (activeTab) {
      return activeTab
    }
    
    switch (pathname) {
      case '/dashboard':
        return 'calendar'
      case '/dashboard/calendar':
        return 'calendar'
      case '/dashboard/presence':
        return 'aula-calendar'
      case '/dashboard/chat':
        return 'messages'
      case '/dashboard/profile':
        return 'profile'
      default:
        return 'calendar'
    }
  }

  const currentActiveTab = getCurrentActiveTab()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Calendar, hideOnMobile: true },
    { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Aule', href: '/dashboard/presence', icon: Calendar },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Profilo', href: '/dashboard/profile', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleMobileNavigation = (tab: string) => {
    const currentPath = pathname
    
    // Il tab 'profile' naviga sempre a /dashboard/profile (non c'è tab profile nella dashboard principale)
    if (tab === 'profile') {
      if (currentPath !== '/dashboard/profile') {
        router.push('/dashboard/profile')
      }
      return
    }
    
    // Se siamo nella dashboard principale, usa il sistema di tab interno
    if (currentPath === '/dashboard' && onTabChange) {
      onTabChange(tab)
    } else {
      // Se siamo in una pagina separata, reindirizza alla pagina corretta
      if (tab === 'calendar') {
        if (currentPath !== '/dashboard/calendar') {
          router.push('/dashboard/calendar')
        }
      } else if (tab === 'aula-calendar') {
        if (currentPath !== '/dashboard/presence') {
          router.push('/dashboard/presence')
        }
      } else if (tab === 'messages') {
        if (currentPath !== '/dashboard/chat') {
          router.push('/dashboard/chat')
        }
      }
    }
  }

  const handleNewUdienza = () => {
    // Questa funzione sarà gestita dal dialog
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Scale 
                className="h-8 w-8" 
                style={{
                  color: '#9B4A52',
                  fill: '#9B4A52',
                  stroke: '#9B4A52'
                }} 
              />
              <span className="ml-2 text-xl font-bold text-gray-900">Julia</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md click-red-shadow ${item.hideOnMobile ? 'hidden lg:flex' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Tasto Impostazioni con dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md click-red-shadow">
                  <Settings className="mr-3 h-5 w-5" />
                  Impostazioni
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnetti</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Scale className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Julia</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md click-red-shadow ${item.hideOnMobile ? 'hidden lg:flex' : ''}`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Tasto Impostazioni con dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md click-red-shadow">
                  <Settings className="mr-3 h-5 w-5" />
                  Impostazioni
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnetti</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Searchbar - solo su mobile */}
            <div className="flex-1 lg:hidden flex items-center">
              <ProfileSearch compact={true} />
            </div>
            <div className="hidden lg:flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <NotificationBadge />
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
                onClick={() => router.push('/dashboard/profile')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 pb-20 lg:pb-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile Footer Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="grid grid-cols-5 gap-1">
            <button 
              onClick={() => handleMobileNavigation('calendar')}
              className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                currentActiveTab === 'calendar' 
                  ? 'text-canossa-red' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span>Calendario</span>
            </button>
            <button 
              onClick={() => handleMobileNavigation('aula-calendar')}
              className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                currentActiveTab === 'aula-calendar' 
                  ? 'text-canossa-red' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span>Aule</span>
            </button>
            <button 
              onClick={() => handleMobileNavigation('messages')}
              className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                currentActiveTab === 'messages' 
                  ? 'text-canossa-red' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span>Messaggi</span>
            </button>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <button className="flex flex-col items-center py-2 px-1 text-xs text-gray-600 hover:text-gray-900 transition-colors">
                  <Plus className="h-5 w-5 mb-1" />
                  <span>Nuova</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader className="lg:pb-4 pb-2">
                  <DialogTitle className="hidden lg:block">Aggiungi Nuova Udienza</DialogTitle>
                  <DialogDescription className="hidden lg:block">
                    Inserisci i dettagli della tua udienza
                  </DialogDescription>
                </DialogHeader>
                <AddUdienzaForm 
                  onSuccess={() => {
                    // Refresh della pagina o aggiornamento dei dati
                    window.location.reload()
                  }} 
                  onCancel={() => setShowAddForm(false)}
                />
              </DialogContent>
            </Dialog>
            <button 
              onClick={() => handleMobileNavigation('profile')}
              className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                currentActiveTab === 'profile' 
                  ? 'text-canossa-red' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="h-5 w-5 mb-1" />
              <span>Profilo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
