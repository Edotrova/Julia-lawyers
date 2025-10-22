'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Building, MessageSquare } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Udienza = Database['public']['Tables']['udienze']['Row'] & {
  aule: Database['public']['Tables']['aule']['Row'] & {
    tribunali: Database['public']['Tables']['tribunali']['Row']
  } | null
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [udienze, setUdienze] = useState<Udienza[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchUdienze()
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Errore nel caricamento del profilo:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Errore:', error)
    }
  }

  const fetchUdienze = async () => {
    try {
      const { data, error } = await supabase
        .from('udienze')
        .select(`
          *,
          aule (
            *,
            tribunali (*)
          )
        `)
        .eq('user_id', userId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Errore nel caricamento delle udienze:', error)
        return
      }

      setUdienze(data || [])
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  const handleStartChat = () => {
    // Naviga alla pagina chat con l'utente selezionato
    router.push(`/dashboard/chat?user=${userId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profilo non trovato</h1>
          <p className="text-gray-600 mb-6">L'avvocato che stai cercando non esiste o non è più disponibile.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna al Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profilo principale */}
        <div className="lg:col-span-1 order-1 lg:order-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.first_name[0]}{profile.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <div className="text-gray-600">
                Avv. {profile.bar_number}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.specialization && profile.specialization.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Specializzazioni</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.bio && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Biografia</h4>
                  <p className="text-sm text-gray-600">{profile.bio}</p>
                </div>
              )}

              <div className="space-y-2">
                {profile.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {profile.phone}
                  </div>
                )}
                <Button 
                  onClick={handleStartChat}
                  className="mt-4 click-red-shadow bg-canossa-red hover:bg-canossa-red/90 text-white"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contatta via chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Udienze prossime */}
        <div className="lg:col-span-2 order-2 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Prossime Udienze
              </CardTitle>
            </CardHeader>
            <CardContent>
              {udienze.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nessuna udienza programmata
                </p>
              ) : (
                <div className="space-y-4">
                  {udienze.map((udienza) => (
                    <div key={udienza.id} className="p-4 border rounded-lg bg-white shadow-sm">
                      {/* Header con status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {format(parseISO(udienza.date), 'dd/MM/yyyy', { locale: it })}
                          </span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {udienza.status === 'scheduled' ? 'Programmata' : 
                           udienza.status === 'completed' ? 'Completata' : 'Cancellata'}
                        </Badge>
                      </div>
                      
                      {/* Contenuto principale */}
                      <div className="space-y-2">
                        {/* Orario */}
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-2 text-gray-400" />
                          <span className="font-medium">{formatTime(udienza.time)}</span>
                        </div>
                        
                        {/* Tribunale - responsive */}
                        <div className="flex items-start text-sm text-gray-600">
                          <Building className="h-3 w-3 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="break-words">{udienza.aule?.tribunali?.name}</span>
                        </div>
                        
                        {/* Aula - responsive */}
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="break-words">{udienza.aule?.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
