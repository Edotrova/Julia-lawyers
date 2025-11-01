'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format, parseISO, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { MapPin, Users, Clock, Calendar, ChevronLeft, ChevronRight, Building, Filter, Send, Eye, User, MessageCircle } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Udienza = Database['public']['Tables']['udienze']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null
  aule: Database['public']['Tables']['aule']['Row'] & {
    tribunali: Database['public']['Tables']['tribunali']['Row']
  } | null
}

type Aula = Database['public']['Tables']['aule']['Row'] & {
  tribunali: Database['public']['Tables']['tribunali']['Row']
}

type Tribunale = Database['public']['Tables']['tribunali']['Row']

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AulaCalendarViewProps {
  // Props can be added here in the future
}

export function AulaCalendarView({}: AulaCalendarViewProps = {}) {
  const [aule, setAule] = useState<Aula[]>([])
  const [tribunali, setTribunali] = useState<Tribunale[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTribunale, setSelectedTribunale] = useState<string>('')
  const [selectedAula, setSelectedAula] = useState<string>('')
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [udienze, setUdienze] = useState<Udienza[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedDayUdienze, setSelectedDayUdienze] = useState<Udienza[]>([])
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<Udienza | null>(null)
  const [selectedChatUser, setSelectedChatUser] = useState<Udienza | null>(null)
  const [chatMessage, setChatMessage] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    sender: string
    message: string
    timestamp: Date
    isCurrentUser: boolean
  }>>([])
  const supabase = createClient()

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchTribunali()
      getCurrentUser()
      // Carica i filtri salvati dopo aver caricato i tribunali
      loadSavedFilters()
      setIsInitialized(true)
    }
    initializeComponent()
  }, [])

  // Carica i filtri salvati dal localStorage
  const loadSavedFilters = () => {
    try {
      const savedFilters = localStorage.getItem('aula-calendar-view-filters')
      if (savedFilters) {
        const filters = JSON.parse(savedFilters)
        console.log('🔄 Caricamento filtri salvati:', filters)
        
        // Applica i filtri salvati
        if (filters.selectedCity) setSelectedCity(filters.selectedCity)
        if (filters.selectedType) setSelectedType(filters.selectedType)
        if (filters.selectedTribunale) setSelectedTribunale(filters.selectedTribunale)
        if (filters.selectedAula) setSelectedAula(filters.selectedAula)
        // Non ripristinare la settimana dai filtri salvati - mantieni sempre la settimana corrente
        // if (filters.currentWeek) {
        //   setCurrentWeek(new Date(filters.currentWeek))
        // }
      }
    } catch (error) {
      console.error('Errore nel caricamento dei filtri salvati:', error)
    }
  }

  // Forza sempre la settimana corrente al caricamento
  useEffect(() => {
    setCurrentWeek(new Date())
  }, [])

  // Salva i filtri nel localStorage
  const saveFilters = () => {
    try {
      const filters = {
        selectedCity,
        selectedType,
        selectedTribunale,
        selectedAula
        // Non salvare la settimana - mantieni sempre la settimana corrente
        // currentWeek: currentWeek.toISOString()
      }
      console.log('💾 Salvataggio filtri:', filters)
      localStorage.setItem('aula-calendar-view-filters', JSON.stringify(filters))
    } catch (error) {
      console.error('Errore nel salvataggio dei filtri:', error)
    }
  }

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user?.id || null)
    } catch (error) {
      console.error('Errore nel recupero utente:', error)
      setCurrentUser(null)
    }
  }

  const handleChat = async (udienza: Udienza) => {
    // Apri modal chat privata
    setSelectedChatUser(udienza)
    setChatMessage('') // Reset input
    
    // Carica messaggi esistenti
    if (currentUser) {
      try {
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            profiles (*)
          `)
          .or(`and(sender_id.eq.${currentUser},receiver_id.eq.${udienza.user_id}),and(sender_id.eq.${udienza.user_id},receiver_id.eq.${currentUser})`)
          .order('created_at', { ascending: true })

        if (data) {
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            sender: msg.sender_id,
            message: msg.content,
            timestamp: new Date(msg.created_at),
            isCurrentUser: msg.sender_id === currentUser
          }))
          setChatMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Errore nel caricamento dei messaggi:', error)
        setChatMessages([])
      }
    }
  }

  const sendMessage = async () => {
    if (!chatMessage.trim() || !selectedChatUser || !currentUser) return

    const messageContent = chatMessage.trim()
    setChatMessage('')

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser,
          receiver_id: selectedChatUser.user_id,
          content: messageContent,
          message_type: 'private'
        })

      if (error) {
        console.error('Errore nell\'invio del messaggio:', error)
        return
      }

      // Aggiorna i messaggi locali
      const newMessage = {
        id: Date.now().toString(),
        sender: currentUser,
        message: messageContent,
        timestamp: new Date(),
        isCurrentUser: true
      }
      setChatMessages(prev => [...prev, newMessage])

    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error)
    }
  }

  const handleViewProfile = (udienza: Udienza) => {
    // Apri modal profilo
    setSelectedProfile(udienza)
  }


  useEffect(() => {
    if (selectedCity) {
      fetchTribunaliByCity()
    }
  }, [selectedCity])

  useEffect(() => {
    if (selectedTribunale) {
      fetchAuleByTribunale()
    }
  }, [selectedTribunale])

  useEffect(() => {
    if (selectedAula) {
      fetchUdienzeForWeek()
    }
  }, [selectedAula, currentWeek])

  // Salva i filtri quando cambiano (solo dopo l'inizializzazione)
  useEffect(() => {
    if (isInitialized) {
      saveFilters()
    }
  }, [selectedCity, selectedType, selectedTribunale, selectedAula, isInitialized])


  const fetchTribunali = async () => {
    try {
      console.log('🔍 Tentativo di caricamento tribunali...')
      
      const { data, error } = await supabase
        .from('tribunali')
        .select('*')
        .order('city')

      console.log('📊 Risultato query tribunali:', { data, error })
      
      if (error) {
        console.error('❌ Errore nella query tribunali:', error)
        console.error('Dettagli errore:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      console.log('✅ Tribunali caricati:', data?.length || 0)
      setTribunali(data || [])
      
      // Estrai le città uniche
      const uniqueCities = [...new Set(data?.map(t => t.city) || [])].sort()
      setCities(uniqueCities)
      
      // Non auto-selezionare più la città se ci sono filtri salvati
      // La selezione avverrà tramite loadSavedFilters()
    } catch (error) {
      console.error('❌ Errore nel caricamento dei tribunali:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTribunaliByCity = async () => {
    if (!selectedCity) return

    try {
      const { data } = await supabase
        .from('tribunali')
        .select('*')
        .eq('city', selectedCity)
        .order('type')

      setTribunali(data || [])
      
      // Non auto-selezionare più i valori per evitare sovrascrittura dei filtri salvati
      // I valori vengono gestiti tramite loadSavedFilters()
    } catch (error) {
      console.error('Errore nel caricamento dei tribunali per città:', error)
    }
  }

  const fetchAuleByTribunale = async () => {
    if (!selectedTribunale) return

    try {
      const { data } = await supabase
        .from('aule')
        .select(`
          *,
          tribunali (*)
        `)
        .eq('tribunale_id', selectedTribunale)
        .order('name')

      setAule(data || [])
      
      // Non auto-selezionare più l'aula per evitare sovrascrittura dei filtri salvati
      // I valori vengono gestiti tramite loadSavedFilters()
    } catch (error) {
      console.error('Errore nel caricamento delle aule:', error)
    }
  }

  const fetchUdienzeForWeek = async () => {
    if (!selectedAula) return

    try {
      setLoading(true)
      const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const endDate = endOfWeek(currentWeek, { weekStartsOn: 1 })

      console.log('Caricamento udienze per aula:', selectedAula)
      console.log('Periodo:', format(startDate, 'yyyy-MM-dd'), 'a', format(endDate, 'yyyy-MM-dd'))

      // Prima proviamo a vedere se ci sono udienze nella tabella
      console.log('Test: caricamento di tutte le udienze...')
      const { data: allUdienze, error: allError } = await supabase
        .from('udienze')
        .select('*')
        .limit(5)

      console.log('Tutte le udienze:', allUdienze)
      if (allError) {
        console.error('Errore nel caricamento di tutte le udienze:', allError)
        console.error('Dettagli errore tutte udienze:', {
          message: allError.message,
          details: allError.details,
          hint: allError.hint,
          code: allError.code
        })
      }

      // Query con join ai profili, aule e tribunali
      const { data, error } = await supabase
        .from('udienze')
        .select(`
          *,
          aule (
            *,
            tribunali (*)
          )
        `)
        .eq('aula_id', selectedAula)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      // Usa direttamente il campo autore dalla tabella udienze
      setUdienze(data || [])
      console.log('📋 Udienze caricate con autore:', data)

      if (error) {
        console.error('Errore nel caricamento delle udienze:', error)
        return
      }

      setUdienze(data || [])
      console.log('Udienze caricate:', data)
    } catch (error) {
      console.error('Errore nel caricamento delle udienze:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedAula = () => {
    return aule.find(aula => aula.id === selectedAula)
  }

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const getUdienzeForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return udienze.filter(udienza => udienza.date === dateStr)
  }

  const formatTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), 'HH:mm')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subDays(prev, 7))
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7))
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const handleDayClick = (day: Date) => {
    const dayUdienze = getUdienzeForDate(day)
    setSelectedDay(day)
    setSelectedDayUdienze(dayUdienze)
  }

  const isMyUdienza = (udienza: Udienza) => {
    return currentUser && udienza.user_id === currentUser
  }

  const getUdienzaColor = (udienza: Udienza) => {
    if (isMyUdienza(udienza)) {
      return 'bg-canossa-subtle-bg border-canossa-red text-canossa-red'
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const getFilteredUdienze = () => {
    if (timeFilter === 'all') return selectedDayUdienze
    
    switch (timeFilter) {
      case 'morning':
        return selectedDayUdienze.filter(udienza => {
          const udienzaHour = parseInt(udienza.time.split(':')[0])
          return udienzaHour >= 8 && udienzaHour < 12
        })
      case 'afternoon':
        return selectedDayUdienze.filter(udienza => {
          const udienzaHour = parseInt(udienza.time.split(':')[0])
          return udienzaHour >= 12 && udienzaHour < 18
        })
      case 'evening':
        return selectedDayUdienze.filter(udienza => {
          const udienzaHour = parseInt(udienza.time.split(':')[0])
          return udienzaHour >= 18
        })
      default:
        return selectedDayUdienze
    }
  }


  if (loading && aule.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-gray-900">Calendario Aula</h2>
          <p className="text-gray-600">Visualizza chi sarà presente in aula durante la settimana</p>
        </div>
      </div>

      {/* Filtri di selezione */}
      <Card>
        <CardHeader className="lg:pb-6 pb-2">
          <CardTitle className="hidden lg:flex items-center text-sm lg:text-base">
            <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            <span>Selezione Tribunale e Aula</span>
          </CardTitle>
          <CardDescription className="hidden lg:block">
            Seleziona prima la città, poi il tipo di tribunale, infine l&apos;aula specifica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
            {/* Selezione Città */}
            <div className="space-y-1 lg:space-y-2">
              <Label htmlFor="city" className="text-xs lg:text-sm">Circondario</Label>
              <Select value={selectedCity} onValueChange={(value) => {
                setSelectedCity(value)
                setSelectedType('')
                setSelectedTribunale('')
                setSelectedAula('')
              }}>
                <SelectTrigger className="h-8 lg:h-10 text-xs lg:text-sm">
                  <SelectValue placeholder="Circondario" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        {city}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selezione Tipo Tribunale */}
            <div className="space-y-1 lg:space-y-2">
              <Label htmlFor="type" className="text-xs lg:text-sm">Settore</Label>
              <Select 
                value={selectedType} 
                onValueChange={(value) => {
                  setSelectedType(value)
                  setSelectedTribunale('')
                  setSelectedAula('')
                }}
                disabled={!selectedCity}
              >
                <SelectTrigger className="h-8 lg:h-10 text-xs lg:text-sm">
                  <SelectValue placeholder="Settore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penale">Penale</SelectItem>
                  <SelectItem value="civile">Civile</SelectItem>
                  <SelectItem value="amministrativo">Amministrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selezione Tribunale */}
            <div className="space-y-1 lg:space-y-2">
              <Label htmlFor="tribunale" className="text-xs lg:text-sm">Autorità Giudiziaria</Label>
              <Select 
                value={selectedTribunale} 
                onValueChange={(value) => {
                  setSelectedTribunale(value)
                  setSelectedAula('')
                }}
                disabled={!selectedType}
              >
                <SelectTrigger className="h-8 lg:h-10 text-xs lg:text-sm">
                  <SelectValue placeholder="Autorità Giudiziaria" />
                </SelectTrigger>
                <SelectContent>
                  {tribunali
                    .filter(t => t.type === selectedType)
                    .map((tribunale) => (
                    <SelectItem key={tribunale.id} value={tribunale.id}>
                      <div className="flex items-center">
                        <Building className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        {tribunale.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selezione Aula */}
            <div className="space-y-1 lg:space-y-2">
              <Label htmlFor="aula" className="text-xs lg:text-sm">Aula</Label>
              <Select 
                value={selectedAula} 
                onValueChange={setSelectedAula}
                disabled={!selectedTribunale}
              >
                <SelectTrigger className="h-8 lg:h-10 text-xs lg:text-sm">
                  <SelectValue placeholder="Aula" />
                </SelectTrigger>
                <SelectContent>
                  {aule.map((aula) => (
                    <SelectItem key={aula.id} value={aula.id}>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        {aula.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Controlli settimana */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* Desktop: titolo completo */}
            <CardTitle className="hidden md:flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Settimana del {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: it })} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: it })}
            </CardTitle>
            {/* Mobile: solo date senza "Settimana del" */}
            <div className="md:hidden flex items-center text-sm font-normal">
              <Calendar className="h-4 w-4 mr-2" />
              {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: it })} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: it })}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="click-red-shadow">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {/* Pulsante "Oggi" nascosto su mobile */}
              <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="click-red-shadow hidden md:inline-flex">
                Oggi
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek} className="click-red-shadow">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendario settimanale */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
        {getWeekDays().map((day, index) => {
          const dayUdienze = getUdienzeForDate(day)
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 click-red-shadow ${
                isToday ? 'ring-2 ring-canossa-red bg-canossa-subtle-bg' : ''
              } ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''} ${
                dayUdienze.length > 0 ? 'border-l-4 border-l-canossa-red' : ''
              }`}
              onClick={() => handleDayClick(day)}
            >
              <CardHeader className="pb-1 md:pb-2 px-2 md:px-6 pt-2 md:pt-6">
                <CardTitle className="text-xs md:text-sm">
                  {format(day, 'EEEE', { locale: it })}
                </CardTitle>
                <CardDescription className="text-xs">
                  {format(day, 'dd/MM', { locale: it })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-2 md:px-6 pb-2 md:pb-6">
                {loading ? (
                  <div className="flex items-center justify-center h-12 md:h-20">
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-gray-900"></div>
                  </div>
                ) : dayUdienze.length === 0 ? (
                  <div className="text-center py-2 md:py-4 text-gray-500 text-xs md:text-sm">
                    Nessuna udienza
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Riepilogo udienze del giorno */}
                    <div className="p-2 md:p-3 bg-gradient-to-r from-canossa-subtle-bg to-canossa-subtle-bg border border-canossa-red rounded-lg cursor-pointer hover:from-canossa-subtle-bg hover:to-canossa-subtle-bg transition-all duration-200 click-red-shadow"
                         onClick={() => setSelectedDay(day)}>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-canossa-red rounded-full animate-pulse"></div>
                          <span className="text-xs md:text-sm font-medium text-gray-900">
                            {dayUdienze.length} udienza{dayUdienze.length !== 1 ? 'e' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>


      {/* Modal per dettagli giorno selezionato */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Udienze del {selectedDay && format(selectedDay, 'dd/MM/yyyy', { locale: it })}
            </DialogTitle>
          </DialogHeader>
          
          {/* Filtro per orario */}
          <div className="flex items-center space-x-4 mb-6">
            <Label className="text-sm font-medium">Filtra per orario:</Label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="morning">Mattina (8-12)</SelectItem>
                <SelectItem value="afternoon">Pomeriggio (12-18)</SelectItem>
                <SelectItem value="evening">Sera (18+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {getFilteredUdienze().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nessuna udienza trovata per questo periodo</p>
              </div>
            ) : (
              getFilteredUdienze().slice(0, 3).map((udienza) => (
                <Card key={udienza.id} className={`border-2 hover:shadow-md transition-all duration-200 ${
                  isMyUdienza(udienza) ? 'border-canossa-red bg-canossa-subtle-bg' : 'border-gray-200'
                }`}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {/* Header con status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(udienza.status)}>
                            {udienza.status === 'scheduled' ? '' : 
                             udienza.status === 'completed' ? 'Completata' : 'Cancellata'}
                          </Badge>
                        {isMyUdienza(udienza) && (
                          <Badge variant="secondary" className="canossa-subtle-bg canossa-accent">
                            Mia Udienza
                          </Badge>
                        )}
                        </div>
                      </div>

                    {/* Layout professionale: orario, avvocato e azioni */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" style={{ color: 'var(--canossa-red)' }} />
                          <div className="font-medium text-sm">{formatTime(udienza.time)}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" style={{ color: 'var(--canossa-red)' }} />
                          <div className="font-medium text-sm">
                            {isMyUdienza(udienza) ? udienza.title : (udienza.autore || 'Avvocato non disponibile')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Pulsanti Chat e Profilo - solo se non è l'udienza dell'utente corrente */}
                      {currentUser && udienza.user_id !== currentUser && (
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleChat(udienza)}
                            title="Invia messaggio"
                            style={{ borderColor: 'var(--canossa-red)', color: 'var(--canossa-red)' }}
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleViewProfile(udienza)}
                            title="Vedi profilo"
                            style={{ borderColor: 'var(--canossa-red)', color: 'var(--canossa-red)' }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Descrizione se presente - solo per le proprie udienze */}
                    {udienza.description && isMyUdienza(udienza) && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-600">{udienza.description}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))
            )}
            {getFilteredUdienze().length > 3 && (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  Mostrando 3 di {getFilteredUdienze().length} udienze
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Filtra per vedere altre udienze
                </p>
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>

      {/* Modal Profilo Avvocato */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profilo Avvocato
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
              {/* Header profilo */}
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-2xl">
                    {selectedProfile.autore ? selectedProfile.autore.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{selectedProfile.autore}</h3>
                <p className="text-gray-600">Avvocato</p>
              </div>

              {/* Informazioni udienza */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Udienza Corrente</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{format(parseISO(selectedProfile.date), 'dd/MM/yyyy', { locale: it })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatTime(selectedProfile.time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedProfile.aule?.tribunali?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedProfile.aule?.name}</span>
                  </div>
                  {/* Mostra le note solo se l'udienza appartiene all'utente corrente */}
                  {selectedProfile.description && currentUser && selectedProfile.user_id === currentUser && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        <strong>Note:</strong> {selectedProfile.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informazioni aggiuntive */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">Informazioni Professionali</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Specializzazione: Diritto {selectedProfile.aule?.tribunali?.type === 'penale' ? 'Penale' : 
                          selectedProfile.aule?.tribunali?.type === 'civile' ? 'Civile' : 'Amministrativo'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Zona di competenza: {selectedProfile.aule?.tribunali?.city}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    <span>Studio legale: {selectedProfile.aule?.tribunali?.address}</span>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex space-x-3">
                <Button 
                  onClick={() => {
                    setSelectedProfile(null)
                    setSelectedChatUser(selectedProfile)
                  }}
                  className="flex-1 click-red-shadow"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Invia Messaggio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProfile(null)}
                  className="click-red-shadow"
                >
                  Chiudi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Chat Privata */}
      <Dialog open={!!selectedChatUser} onOpenChange={() => setSelectedChatUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Chat Privata
            </DialogTitle>
          </DialogHeader>
          
          {selectedChatUser && (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Header chat */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={undefined} />
                  <AvatarFallback>
                    {selectedChatUser.autore ? selectedChatUser.autore.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedChatUser.autore}</h4>
                  <p className="text-sm text-gray-500">Avvocato</p>
                </div>
              </div>

              {/* Area messaggi */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Inizia una conversazione con {selectedChatUser.autore}</p>
                    <p className="text-sm">I messaggi appariranno qui</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.isCurrentUser
                              ? 'bg-canossa-red text-white'
                              : 'bg-white text-gray-900 border canossa-border-accent'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {format(msg.timestamp, 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input messaggio */}
              <div className="flex space-x-2">
                <Input 
                  placeholder="Scrivi un messaggio..."
                  className="flex-1"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!chatMessage.trim()}
                  className="click-red-shadow"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Azioni */}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedChatUser(null)}
                  className="click-red-shadow"
                >
                  Chiudi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
