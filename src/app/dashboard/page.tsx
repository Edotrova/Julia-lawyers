'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { CalendarView } from '@/components/calendar/calendar-view'
import { AulaCalendarView } from '@/components/courtroom/aula-calendar-view'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ProfileSearch } from '@/components/dashboard/profile-search'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useRefreshStats } from '@/hooks/use-refresh-stats'
import { useAllUdienze } from '@/components/providers/all-udienze-provider'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

function DashboardPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshTrigger, refreshStats } = useRefreshStats()
  const { openAllUdienze } = useAllUdienze()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('calendar')
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

  const handleOggiClick = () => {
    const today = new Date().toISOString().split('T')[0]
    openAllUdienze(today)
  }

  const handleSettimanaClick = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Lunedì
    const startWeekStr = startOfWeek.toISOString().split('T')[0]
    openAllUdienze(startWeekStr)
  }

  const handleMessaggiClick = () => {
    // Naviga alla pagina chat
    router.push('/dashboard/chat')
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-4 md:space-y-6">
        {/* Header con titolo e searchbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-canossa-red">
              {profileLoading ? (
                <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-32 rounded"></div>
              ) : profile ? (
                `Avv. ${profile.last_name}`
              ) : (
                'Dashboard'
              )}
            </h1>
          </div>
          
          {/* Searchbar responsive - solo su desktop */}
          <div className="hidden lg:block w-full lg:w-80">
            <ProfileSearch />
          </div>
        </div>

        <DashboardStats 
          refreshTrigger={refreshTrigger}
          onOggiClick={handleOggiClick}
          onSettimanaClick={handleSettimanaClick}
          onMessaggiClick={handleMessaggiClick}
        />

        <div className="space-y-6">
          {/* Tab Navigation - nascosto su mobile */}
          <div className="hidden lg:block w-full bg-gray-100 rounded-lg p-1 flex">
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
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  )
}
