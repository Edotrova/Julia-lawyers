'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parseISO, addMinutes } from 'date-fns'
import { it } from 'date-fns/locale'
import { MapPin, Users, Clock, Calendar, Search, User, Building, Filter } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Udienza = Database['public']['Tables']['udienze']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  aule: Database['public']['Tables']['aule']['Row'] & {
    tribunali: Database['public']['Tables']['tribunali']['Row']
  }
}

type Aula = Database['public']['Tables']['aule']['Row'] & {
  tribunali: Database['public']['Tables']['tribunali']['Row']
}

type Tribunale = Database['public']['Tables']['tribunali']['Row']

export function AulaCalendarSearch() {
  const [aule, setAule] = useState<Aula[]>([])
  const [tribunali, setTribunali] = useState<Tribunale[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTribunale, setSelectedTribunale] = useState<string>('')
  const [selectedAula, setSelectedAula] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [udienze, setUdienze] = useState<Udienza[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchTribunali()
      // Carica i filtri salvati dopo aver caricato i tribunali
      loadSavedFilters()
      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user.id)
      }
      setIsInitialized(true)
    }
    initializeComponent()
  }, [])

  // Funzione per controllare se l'udienza è propria
  const isMyUdienza = (udienza: Udienza) => {
    return currentUser && udienza.user_id === currentUser
  }

  // Carica i filtri salvati dal localStorage
  const loadSavedFilters = () => {
    try {
      const savedFilters = localStorage.getItem('aula-calendar-filters')
      if (savedFilters) {
        const filters = JSON.parse(savedFilters)
        console.log('🔄 Caricamento filtri salvati:', filters)
        
        // Applica i filtri salvati
        if (filters.selectedCity) setSelectedCity(filters.selectedCity)
        if (filters.selectedType) setSelectedType(filters.selectedType)
        if (filters.selectedTribunale) setSelectedTribunale(filters.selectedTribunale)
        if (filters.selectedAula) setSelectedAula(filters.selectedAula)
        if (filters.selectedDate) setSelectedDate(filters.selectedDate)
      }
    } catch (error) {
      console.error('Errore nel caricamento dei filtri salvati:', error)
    }
  }

  // Salva i filtri nel localStorage
  const saveFilters = () => {
    try {
      const filters = {
        selectedCity,
        selectedType,
        selectedTribunale,
        selectedAula,
        selectedDate
      }
      console.log('💾 Salvataggio filtri:', filters)
      localStorage.setItem('aula-calendar-filters', JSON.stringify(filters))
    } catch (error) {
      console.error('Errore nel salvataggio dei filtri:', error)
    }
  }

  useEffect(() => {
    if (selectedAula && selectedDate) {
      fetchUdienzeForAula()
    }
  }, [selectedAula, selectedDate])

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

  // Salva i filtri quando cambiano (solo dopo l'inizializzazione)
  useEffect(() => {
    if (isInitialized) {
      saveFilters()
    }
  }, [selectedCity, selectedType, selectedTribunale, selectedAula, selectedDate, isInitialized])

  const fetchTribunali = async () => {
    try {
      const { data } = await supabase
        .from('tribunali')
        .select('*')
        .order('city')

      setTribunali(data || [])
      
      // Estrai le città uniche
      const uniqueCities = [...new Set(data?.map(t => t.city) || [])].sort()
      setCities(uniqueCities)
      
      // Non auto-selezionare più la città se ci sono filtri salvati
      // La selezione avverrà tramite loadSavedFilters()
    } catch (error) {
      console.error('Errore nel caricamento dei tribunali:', error)
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

  const fetchUdienzeForAula = async () => {
    if (!selectedAula || !selectedDate) return

    try {
      setLoading(true)
      const { data } = await supabase
        .from('udienze')
        .select(`
          *,
          profiles (*),
          aule (
            *,
            tribunali (*)
          )
        `)
        .eq('aula_id', selectedAula)
        .eq('date', selectedDate)
        .eq('status', 'scheduled')
        .order('time', { ascending: true })

      setUdienze(data || [])
    } catch (error) {
      console.error('Errore nel caricamento delle udienze:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedAula = () => {
    return aule.find(aula => aula.id === selectedAula)
  }

  const formatTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), 'HH:mm')
  }

  const getEndTime = (time: string, duration: number) => {
    const startTime = parseISO(`2000-01-01T${time}`)
    const endTime = addMinutes(startTime, duration)
    return format(endTime, 'HH:mm')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chi è in Aula</h2>
          <p className="text-gray-600">Scopri quali avvocati hanno udienze programmate in una specifica aula e data</p>
        </div>
      </div>

      {/* Filtri di ricerca */}
      <Card>
        <CardHeader className="lg:pb-6 pb-2">
          <CardTitle className="hidden lg:flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Ricerca per Tribunale e Aula
          </CardTitle>
          <CardDescription className="hidden lg:block">
            Seleziona prima la città, poi il tipo di tribunale, infine l&apos;aula specifica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Selezione Città */}
            <div className="space-y-2">
              <Label htmlFor="city">Circondario</Label>
              <Select value={selectedCity} onValueChange={(value) => {
                setSelectedCity(value)
                setSelectedType('')
                setSelectedTribunale('')
                setSelectedAula('')
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona circondario" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {city}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selezione Tipo Tribunale */}
            <div className="space-y-2">
              <Label htmlFor="type">Settore</Label>
              <Select 
                value={selectedType} 
                onValueChange={(value) => {
                  setSelectedType(value)
                  setSelectedTribunale('')
                  setSelectedAula('')
                }}
                disabled={!selectedCity}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona settore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penale">Penale</SelectItem>
                  <SelectItem value="civile">Civile</SelectItem>
                  <SelectItem value="amministrativo">Amministrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selezione Tribunale */}
            <div className="space-y-2">
              <Label htmlFor="tribunale">Autorità Giudiziaria</Label>
              <Select 
                value={selectedTribunale} 
                onValueChange={(value) => {
                  setSelectedTribunale(value)
                  setSelectedAula('')
                }}
                disabled={!selectedType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona autorità giudiziaria" />
                </SelectTrigger>
                <SelectContent>
                  {tribunali
                    .filter(t => t.type === selectedType)
                    .map((tribunale) => (
                    <SelectItem key={tribunale.id} value={tribunale.id}>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        {tribunale.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selezione Aula */}
            <div className="space-y-2">
              <Label htmlFor="aula">Aula</Label>
              <Select 
                value={selectedAula} 
                onValueChange={setSelectedAula}
                disabled={!selectedTribunale}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona aula" />
                </SelectTrigger>
                <SelectContent>
                  {aule.map((aula) => (
                    <SelectItem key={aula.id} value={aula.id}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {aula.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data e Pulsante Ricerca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={fetchUdienzeForAula} 
                className="w-full"
                disabled={!selectedAula}
              >
                <Search className="h-4 w-4 mr-2" />
                Cerca Presenze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informazioni tribunale e aula selezionati */}
      {getSelectedAula() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              {getSelectedAula()?.name}
            </CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-medium">{getSelectedAula()?.tribunali.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {getSelectedAula()?.tribunali.type === 'penale' ? 'Penale' : 
                     getSelectedAula()?.tribunali.type === 'civile' ? 'Civile' : 'Amministrativo'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {getSelectedAula()?.tribunali.city} - {getSelectedAula()?.tribunali.address}
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Selezionata</p>
                <p className="text-2xl font-bold">{format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: it })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avvocati Programmati</p>
                <p className="text-2xl font-bold">{udienze.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ora Attuale</p>
                <p className="text-2xl font-bold">{format(new Date(), 'HH:mm')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista degli avvocati programmati */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Avvocati in Aula - {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: it })}
            </CardTitle>
            <CardDescription>
              Lista degli avvocati che saranno presenti in questa aula nella data selezionata
            </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : udienze.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nessun avvocato programmato per questa data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {udienze.map((udienza) => (
                <div key={udienza.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {udienza.profiles?.first_name?.[0]}{udienza.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {udienza.profiles?.first_name} {udienza.profiles?.last_name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {udienza.profiles?.bar_number}
                      </Badge>
                      <Badge className={getStatusColor(udienza.status)}>
                        {udienza.status === 'scheduled' ? 'Programmata' : 
                         udienza.status === 'completed' ? 'Completata' : 'Cancellata'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(udienza.time)} - {getEndTime(udienza.time, udienza.duration)}
                      </span>
                      <span className="font-medium text-gray-900">{udienza.title}</span>
                    </div>
                    {udienza.description && isMyUdienza(udienza) && (
                      <p className="text-sm text-gray-600 mt-1">{udienza.description}</p>
                    )}
                    {udienza.profiles?.specialization && udienza.profiles.specialization.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Specializzazioni:</span> {udienza.profiles.specialization.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
