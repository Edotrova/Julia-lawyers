'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { useNotifications } from '@/hooks/use-notifications'

interface DashboardStatsProps {
  refreshTrigger?: number
}

export function DashboardStats({ refreshTrigger }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    udienzeOggi: 0,
    udienzeSettimana: 0,
    messaggiNonLetti: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    fetchStats()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('dashboard_stats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'udienze' },
        (payload) => {
          console.log('🔄 Aggiornamento udienze:', payload)
          fetchStats()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchStats()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchStats()
    }
  }, [refreshTrigger])

  // Update stats when unread count changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      messaggiNonLetti: unreadCount
    }))
  }, [unreadCount])

  // Force refresh when unread count changes to ensure alignment
  useEffect(() => {
    if (unreadCount !== stats.messaggiNonLetti) {
      fetchStats()
    }
  }, [unreadCount, stats.messaggiNonLetti])

  const fetchStats = async () => {
    try {
      // Usa sempre Supabase Auth invece di localStorage
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ Errore autenticazione Supabase:', authError)
        return
      }
      
      if (!authUser) {
        console.log('⚠️ Nessun utente autenticato')
        return
      }

      const today = format(new Date(), 'yyyy-MM-dd')
      const userId = authUser.id
      const { count: udienzeCount } = await supabase
        .from('udienze')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', today)
        .eq('status', 'scheduled')

      // Conta udienze della settimana
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1) // Lunedì
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6) // Domenica
      
      const startWeekStr = format(startOfWeek, 'yyyy-MM-dd')
      const endWeekStr = format(endOfWeek, 'yyyy-MM-dd')
      
      
      const { count: udienzeSettimanaCount, error: weekError } = await supabase
        .from('udienze')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', startWeekStr)
        .lte('date', endWeekStr)
        .eq('status', 'scheduled')
      
      if (weekError) {
        console.error('❌ Errore nel conteggio udienze settimana:', weekError)
      }

      setStats({
        udienzeOggi: udienzeCount || 0,
        udienzeSettimana: udienzeSettimanaCount || 0,
        messaggiNonLetti: unreadCount,
      })
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 md:gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6">
      <Card className="hover:shadow-md transition-shadow duration-200 border-l-4" style={{ borderLeftColor: 'var(--canossa-red)' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-4 pt-2 md:pt-4">
          <CardTitle className="text-xs md:text-sm font-medium text-gray-700">Oggi</CardTitle>
          <Calendar className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'var(--canossa-red)' }} />
        </CardHeader>
        <CardContent className="px-2 md:px-4 pb-2 md:pb-4">
          <div className="text-responsive-xl font-bold" style={{ color: 'var(--canossa-red)' }}>{stats.udienzeOggi}</div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            {stats.udienzeOggi > 0 ? 'Programmate per oggi' : 'Nessuna udienza oggi'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200 border-l-4" style={{ borderLeftColor: 'var(--canossa-red)' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-4 pt-2 md:pt-4">
          <CardTitle className="text-xs md:text-sm font-medium text-gray-700">Settimana</CardTitle>
          <Calendar className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'var(--canossa-red)' }} />
        </CardHeader>
        <CardContent className="px-2 md:px-4 pb-2 md:pb-4">
          <div className="text-responsive-xl font-bold" style={{ color: 'var(--canossa-red)' }}>{stats.udienzeSettimana}</div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            {stats.udienzeSettimana > 0 ? 'Programmate questa settimana' : 'Nessuna udienza'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200 border-l-4" style={{ borderLeftColor: 'var(--canossa-red)' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-4 pt-2 md:pt-4">
          <CardTitle className="text-xs md:text-sm font-medium text-gray-700">Messaggi</CardTitle>
          <MessageSquare className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'var(--canossa-red)' }} />
        </CardHeader>
        <CardContent className="px-2 md:px-4 pb-2 md:pb-4">
          <div className="text-responsive-xl font-bold" style={{ color: 'var(--canossa-red)' }}>{stats.messaggiNonLetti}</div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            {stats.messaggiNonLetti > 0 
              ? `${stats.messaggiNonLetti} messaggi da leggere` 
              : 'Tutti letti'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
