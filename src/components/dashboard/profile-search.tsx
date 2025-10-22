'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileSearchProps {
  compact?: boolean
}

export function ProfileSearch({ compact = false }: ProfileSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const searchProfiles = async (term: string) => {
    if (term.length < 2) {
      setProfiles([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,bar_number.ilike.%${term}%`)
        .limit(10)

      if (error) {
        console.error('Errore nella ricerca:', error)
        return
      }

      setProfiles(data || [])
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProfiles(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Gestione click fuori dalla searchbar per chiudere i risultati
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleViewProfile = (userId: string) => {
    setSearchTerm('') // Chiudi i risultati di ricerca
    router.push(`/dashboard/profile/${userId}`)
  }

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 flex items-center">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${compact ? 'h-4 w-4' : 'h-4 w-4'}`} />
          <Input
            placeholder={compact ? "Cerca..." : "Cerca colleghi..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${compact ? 'h-10 text-sm' : ''}`}
          />
        </div>
      </div>

      {/* Risultati ricerca */}
      {searchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Ricerca in corso...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nessun avvocato trovato
              </div>
            ) : (
              <div className="divide-y">
                {profiles.map((profile) => (
                  <div key={profile.id} className="p-4 hover:bg-gray-50 flex items-center space-x-3 cursor-pointer" onClick={() => handleViewProfile(profile.user_id)}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {profile.first_name[0]}{profile.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
