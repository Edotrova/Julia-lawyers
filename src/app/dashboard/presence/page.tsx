'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { CalendarView } from '@/components/calendar/calendar-view'
import { AulaCalendarView } from '@/components/courtroom/aula-calendar-view'
import { ChatInterface } from '@/components/chat/chat-interface'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRefreshStats } from '@/hooks/use-refresh-stats'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function PresencePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshTrigger, refreshStats } = useRefreshStats()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('aula-calendar')
  const supabase = createClient()
  
  // Gestisci i parametri URL per impostare il tab corretto
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['calendar', 'aula-calendar', 'messages'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Refresh stats when component mounts or user changes
  useEffect(() => {
    if (user) {
      refreshStats()
    }
  }, [user, refreshStats])

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      
      try {
        setProfileLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Errore nel caricamento del profilo:', error)
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error('Errore:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        {/* Stats per mobile - nascoste su desktop */}
        <div className="lg:hidden">
          <DashboardStats refreshTrigger={refreshTrigger} />
        </div>
          {/* Tab Navigation - nascosto su mobile e su pagine separate */}
          <div className="hidden">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 text-xs sm:text-sm px-2 py-1 rounded-md transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Il Mio Calendario
            </button>
            <button
              onClick={() => setActiveTab('aula-calendar')}
              className={`flex-1 text-xs sm:text-sm px-2 py-1 rounded-md transition-all ${
                activeTab === 'aula-calendar'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario Aula
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 text-xs sm:text-sm px-2 py-1 rounded-md transition-all ${
                activeTab === 'messages'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Messaggi
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-4">
            {/* Su mobile e desktop usa la stessa logica delle tab */}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'aula-calendar' && <AulaCalendarView />}
            {activeTab === 'messages' && (
              <ChatInterface 
                selectedUserId={searchParams.get('user')} 
                selectedRoomId={searchParams.get('room')} 
              />
            )}
          </div>
        </div>
    </DashboardLayout>
  )
}
