'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AddUdienzaForm } from './add-udienza-form'
import { EditUdienzaForm } from './edit-udienza-form'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { it } from 'date-fns/locale'
import { Plus, Clock, MapPin, Users, MoreHorizontal } from 'lucide-react'
import { useAllUdienze } from '@/components/providers/all-udienze-provider'
import type { Database, Aula, Udienza } from '@/lib/types/database'
import './calendar-override.css'

type Tribunale = Database['public']['Tables']['tribunali']['Row']

interface CalendarViewProps {
  onOggiClick?: () => void
  onSettimanaClick?: () => void
  onMessaggiClick?: () => void
}

export function CalendarView({ onOggiClick, onSettimanaClick, onMessaggiClick }: CalendarViewProps) {
  const [udienze, setUdienze] = useState<Udienza[]>([])
  const [aule, setAule] = useState<Aula[]>([])
  const [tribunali, setTribunali] = useState<Tribunale[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [showDayPopup, setShowDayPopup] = useState(false)
  const [popupDate, setPopupDate] = useState<Date | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedUdienza, setSelectedUdienza] = useState<Udienza | null>(null)
  const supabase = createClient()
  const { openAllUdienze } = useAllUdienze()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch udienze
      const { data: udienzeData } = await supabase
        .from('udienze')
        .select(`
          *,
          aule (
            *,
            tribunali (*)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      // Fetch aule e tribunali
      const { data: auleData } = await supabase
        .from('aule')
        .select(`
          *,
          tribunali (*)
        `)

      const { data: tribunaliData } = await supabase
        .from('tribunali')
        .select('*')

      setUdienze(udienzeData || [])
      setAule(auleData || [])
      setTribunali(tribunaliData || [])
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUdienzeForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return udienze.filter(udienza => udienza.date === dateStr)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setPopupDate(date)
    setShowDayPopup(true)
  }

  const handleCalendarClick = (date: Date | undefined) => {
    if (date) {
      // Su desktop, solo aggiorna la data selezionata
      if (window.innerWidth >= 1024) {
        setSelectedDate(date)
        return
      }
      
      // Su mobile, gestisci la popup
      if (selectedDate.toDateString() === date.toDateString()) {
        setShowDayPopup(false)
        // Forza il re-render cambiando temporaneamente la data
        setSelectedDate(new Date(date.getTime() + 1))
        setTimeout(() => {
          setSelectedDate(date)
          setPopupDate(date)
          setShowDayPopup(true)
        }, 50)
      } else {
        handleDateClick(date)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'canossa-subtle-bg canossa-accent'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditUdienza = (udienza: Udienza) => {
    setSelectedUdienza(udienza)
    setShowEditForm(true)
  }

  const handleDeleteUdienza = async (udienzaId: string) => {
    try {
      const { error } = await supabase
        .from('udienze')
        .delete()
        .eq('id', udienzaId)

      if (error) {
        console.error('Errore nella cancellazione dell\'udienza:', error)
      } else {
        fetchData() // Ricarica i dati
      }
    } catch (error) {
      console.error('Errore imprevisto:', error)
    }
  }

  const handleOggiClick = () => {
    if (onOggiClick) {
      onOggiClick()
    } else {
      const today = new Date().toISOString().split('T')[0]
      openAllUdienze(today)
    }
  }

  const handleSettimanaClick = () => {
    if (onSettimanaClick) {
      onSettimanaClick()
    } else {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Lunedì
      const startWeekStr = startOfWeek.toISOString().split('T')[0]
      openAllUdienze(startWeekStr)
    }
  }

  const handleMessaggiClick = () => {
    if (onMessaggiClick) {
      onMessaggiClick()
    } else {
      // Naviga alla pagina chat
      window.location.href = '/dashboard/chat'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmata'
      case 'completed': return 'Completata'
      case 'cancelled': return 'Annullata'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Titolo e descrizione - nascosti su mobile */}
      <div className="hidden md:block">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Calendario Udienze</h2>
        <p className="text-sm md:text-base text-gray-600">Gestisci le tue udienze e visualizza la tua agenda</p>
      </div>
      
          {/* Pulsante azione - nascosto su mobile */}
          <div className="hidden lg:flex justify-center md:justify-start">
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="bg-canossa-red hover:bg-canossa-red-dark text-white w-auto text-sm px-4 py-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuova Udienza
                  </Button>
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
                fetchData()
                setShowAddForm(false)
              }} 
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
            </Dialog>

            {/* Dialog per modificare udienza */}
            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="lg:pb-4 pb-2">
                  <DialogTitle className="hidden lg:block">Modifica Udienza</DialogTitle>
                  <DialogDescription className="hidden lg:block">
                    Modifica i dettagli della tua udienza
                  </DialogDescription>
                </DialogHeader>
                {selectedUdienza && (
                  <EditUdienzaForm 
                    udienza={selectedUdienza}
                    onSuccess={() => {
                      fetchData()
                      setShowEditForm(false)
                      setSelectedUdienza(null)
                    }} 
                    onCancel={() => {
                      setShowEditForm(false)
                      setSelectedUdienza(null)
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="calendar-container">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarClick}
                className="responsive-calendar"
                locale={it}
                style={{
                  '--canossa-calendar-selected': '#9B4A52',
                  '--canossa-calendar-selected-hover': '#7B2F37'
                } as React.CSSProperties}
              />
            </div>
          </Card>
        </div>

        {/* Udienze del giorno selezionato - nascosto su mobile */}
        <div className="hidden lg:block lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg xl:text-xl">
                Udienze del {format(selectedDate, 'dd MMMM yyyy', { locale: it })}
              </CardTitle>
              <CardDescription className="text-sm xl:text-base">
                {getUdienzeForDate(selectedDate).length} udienze programmate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {getUdienzeForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm xl:text-base">Nessuna udienza programmata per questa data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getUdienzeForDate(selectedDate).map((udienza) => (
                    <div key={udienza.id} className="border rounded-lg p-3 xl:p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm xl:text-base">{udienza.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(udienza.status)} text-xs xl:text-sm`}>
                            {getStatusText(udienza.status)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUdienza(udienza)}>
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUdienza(udienza.id)}
                                className="text-red-600"
                              >
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs xl:text-sm text-gray-600">
                        <Clock className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                        {udienza.time}
                      </div>
                      
                      <div className="flex items-center text-xs xl:text-sm text-gray-600">
                        <MapPin className="mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                        {udienza.aule?.name} - {udienza.aule?.tribunali?.name}
                      </div>
                      
                      {udienza.description && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Note:</p>
                          <p className="text-xs xl:text-sm text-gray-700">{udienza.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prossime udienze */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prossime Udienze</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openAllUdienze()}>
                  Vedi tutte
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {udienze
              .filter(udienza => new Date(udienza.date) >= new Date())
              .slice(0, 5)
              .map((udienza) => (
                <div key={udienza.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {format(new Date(udienza.date), 'dd', { locale: it })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(udienza.date), 'MMM', { locale: it })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">{udienza.title}</h4>
                      <p className="text-sm text-gray-600">
                        {udienza.time} - {udienza.aule?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(udienza.status)}>
                      {getStatusText(udienza.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUdienza(udienza)}>
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUdienza(udienza.id)}
                          className="text-red-600"
                        >
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Popup per udienze del giorno cliccato - solo su mobile */}
      {showDayPopup && popupDate && (
        <div className="lg:hidden fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-96 overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Udienze del {format(popupDate, 'dd MMMM yyyy', { locale: it })}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDayPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {getUdienzeForDate(popupDate).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nessuna udienza</p>
                  <p className="text-sm">Non hai udienze programmate per questo giorno</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getUdienzeForDate(popupDate).map((udienza) => (
                    <div key={udienza.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{udienza.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(udienza.status)}>
                            {getStatusText(udienza.status)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUdienza(udienza)}>
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUdienza(udienza.id)}
                                className="text-red-600"
                              >
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-2 h-4 w-4" />
                        {udienza.time}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {udienza.aule?.name} - {udienza.aule?.tribunali?.name}
                      </div>
                      
                      {udienza.description && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Note:</p>
                          <p className="text-sm text-gray-700">{udienza.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
