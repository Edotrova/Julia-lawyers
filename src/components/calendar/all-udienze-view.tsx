'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EditUdienzaForm } from './edit-udienza-form'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { it } from 'date-fns/locale'
import { Clock, MapPin, Users, MoreHorizontal, X } from 'lucide-react'
import type { Database, Aula, Udienza } from '@/lib/types/database'

type Tribunale = Database['public']['Tables']['tribunali']['Row']

interface AllUdienzeViewProps {
  onClose: () => void
  initialDate?: string
}

export function AllUdienzeView({ onClose, initialDate }: AllUdienzeViewProps) {
  const [udienze, setUdienze] = useState<(Udienza & { aule: Aula })[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedUdienza, setSelectedUdienza] = useState<(Udienza & { aule: Aula }) | null>(null)
  const [filterDate, setFilterDate] = useState<string>(initialDate || '')
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
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

      if (error) throw error
      setUdienze(data || [])
    } catch (error) {
      console.error('Errore nel caricamento delle udienze:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUdienza = (udienza: Udienza & { aule: Aula }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const isPastDate = (date: string) => {
    return new Date(date) < new Date()
  }

  const getFilteredUdienze = () => {
    if (!filterDate) return udienze
    return udienze.filter(udienza => udienza.date >= filterDate)
  }

  const getDateText = (date: string) => {
    const udienzaDate = new Date(date)
    if (isToday(udienzaDate)) return 'Oggi'
    if (isTomorrow(udienzaDate)) return 'Domani'
    if (isYesterday(udienzaDate)) return 'Ieri'
    return format(udienzaDate, 'dd MMMM yyyy', { locale: it })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tutte le Udienze</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Caricamento...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#9B4A52]">Tutte le Udienze</CardTitle>
                <CardDescription>
                  {getFilteredUdienze().length} udienze {filterDate ? `dal ${format(new Date(filterDate), 'dd MMMM yyyy', { locale: it })}` : 'totali'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filtro temporale */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="filter-date" className="text-sm font-medium">
                Filtra da data:
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="max-w-xs"
                />
                {filterDate && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFilterDate('')}
                    className="text-xs"
                  >
                    Rimuovi filtro
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {getFilteredUdienze().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  {filterDate ? 'Nessuna udienza trovata' : 'Nessuna udienza'}
                </p>
                <p className="text-sm">
                  {filterDate 
                    ? `Non hai udienze dal ${format(new Date(filterDate), 'dd MMMM yyyy', { locale: it })}`
                    : 'Non hai ancora creato nessuna udienza'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredUdienze().map((udienza) => (
                  <div 
                    key={udienza.id} 
                    className={`border rounded-lg p-4 space-y-2 ${
                      isPastDate(udienza.date) 
                        ? 'bg-gray-50 opacity-60' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          isPastDate(udienza.date) 
                            ? 'text-gray-500' 
                            : 'text-gray-900'
                        }`}>
                          {udienza.title}
                        </h4>
                        <p className={`text-sm ${
                          isPastDate(udienza.date) 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`}>
                          {getDateText(udienza.date)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(udienza.status)} ${
                          isPastDate(udienza.date) ? 'opacity-60' : ''
                        }`}>
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
                    
                    <div className={`flex items-center text-sm ${
                      isPastDate(udienza.date) 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                    }`}>
                      <Clock className="mr-2 h-4 w-4" />
                      {udienza.time}
                    </div>
                    
                    <div className={`flex items-center text-sm ${
                      isPastDate(udienza.date) 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                    }`}>
                      <MapPin className="mr-2 h-4 w-4" />
                      {udienza.aule?.name} - {udienza.aule?.tribunali?.name}
                    </div>
                    
                    {udienza.description && (
                      <div className={`mt-2 pt-2 border-t ${
                        isPastDate(udienza.date) 
                          ? 'border-gray-200' 
                          : 'border-gray-200'
                      }`}>
                        <p className={`text-xs font-medium mb-1 ${
                          isPastDate(udienza.date) 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                        }`}>
                          Note:
                        </p>
                        <p className={`text-sm ${
                          isPastDate(udienza.date) 
                            ? 'text-gray-400' 
                            : 'text-gray-700'
                        }`}>
                          {udienza.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog per modifica udienza */}
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
    </>
  )
}
