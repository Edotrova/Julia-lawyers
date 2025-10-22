'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Bell, MessageSquare, Check, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export function NotificationBadge() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleNotificationClick = (notification: { id: string; type: string; title: string; message: string; sender_id: string; sender_name: string; chat_room_id?: string; receiver_id?: string; created_at: string; read: boolean }) => {
    // Marca come letto
    markAsRead(notification.id)
    
    // Naviga alla dashboard principale con il tab messaggi attivo
    // I parametri della chat saranno gestiti dal componente ChatInterface
    if (notification.chat_room_id) {
      // Chat di gruppo
      router.push(`/dashboard?tab=messages&room=${notification.chat_room_id}`)
    } else if (notification.receiver_id) {
      // Chat privata
      router.push(`/dashboard?tab=messages&user=${notification.sender_id}`)
    } else {
      // Fallback: vai alla dashboard con tab messaggi
      router.push('/dashboard?tab=messages')
    }
    
    setOpen(false)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-canossa-red text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifiche</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tutte lette
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nessuna notifica</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start space-x-3 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0">
                  <div className={`h-2 w-2 rounded-full ${
                    notification.read ? 'bg-gray-300' : 'bg-canossa-red'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    notification.read ? 'text-gray-600' : 'text-gray-900'
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs ${
                    notification.read ? 'text-gray-400' : 'text-gray-600'
                  } truncate`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <Badge className="bg-canossa-red text-white text-xs">
                      Nuovo
                    </Badge>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
