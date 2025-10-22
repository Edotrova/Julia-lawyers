'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database'

type Aula = Database['public']['Tables']['aule']['Row'] & {
  tribunali: Database['public']['Tables']['tribunali']['Row']
}

type Tribunale = Database['public']['Tables']['tribunali']['Row']

interface AddUdienzaFormProps {
  onSuccess: () => void
  onCancel?: () => void
}

export function AddUdienzaForm({ onSuccess, onCancel }: AddUdienzaFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    aula_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [tribunali, setTribunali] = useState<Tribunale[]>([])
  const [aule, setAule] = useState<Aula[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTribunale, setSelectedTribunale] = useState<string>('')
  const [selectedAula, setSelectedAula] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    fetchTribunali()
  }, [])

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
    if (selectedType && tribunali.length > 0) {
      // Filtra i tribunali per tipo quando cambia il tipo
      const filteredTribunali = tribunali.filter(t => t.type === selectedType)
      if (filteredTribunali.length > 0) {
        setSelectedTribunale(filteredTribunali[0].id)
      }
    }
  }, [selectedType, tribunali])

  useEffect(() => {
    if (selectedAula) {
      setFormData(prev => ({ ...prev, aula_id: selectedAula }))
    }
  }, [selectedAula])

  const fetchTribunali = async () => {
    try {
      const { data, error } = await supabase
        .from('tribunali')
        .select('*')
        .order('city')

      if (error) {
        console.error('Errore nel caricamento dei tribunali:', error)
        return
      }

      setTribunali(data || [])
      
      // Estrai le città uniche
      const uniqueCities = [...new Set(data?.map(t => t.city) || [])].sort()
      setCities(uniqueCities)
      
      if (data && data.length > 0) {
        setSelectedCity(data[0].city)
      }
    } catch (error) {
      console.error('Errore nel caricamento dei tribunali:', error)
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
      
      if (data && data.length > 0) {
        setSelectedType(data[0].type)
        setSelectedTribunale(data[0].id)
      }
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
      
      if (data && data.length > 0) {
        setSelectedAula(data[0].id)
      }
    } catch (error) {
      console.error('Errore nel caricamento delle aule:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Utente non autenticato')
        setLoading(false)
        return
      }

      // Carica il profilo dell'utente per ottenere nome e cognome
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single()

      const autore = profile 
        ? `${profile.first_name} ${profile.last_name}`
        : 'Avvocato Sconosciuto'

      const { error } = await supabase
        .from('udienze')
        .insert({
          user_id: user.id,
          aula_id: formData.aula_id,
          title: formData.title,
          description: formData.description || null,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          status: 'scheduled',
          autore: autore, // Aggiungi il nome dell'autore
        })

      if (error) {
        toast.error('Errore nella creazione dell\'udienza: ' + error.message)
      } else {
        toast.success('Udienza creata con successo!')
        onSuccess()
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: 60,
          aula_id: '',
        })
      }
    } catch (error) {
      toast.error('Errore imprevisto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titolo Udienza</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="es. Udienza preliminare - Causa n. 123/2024"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrizione (opzionale)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Note aggiuntive sull'udienza..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Ora</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Durata (minuti)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          min="15"
          max="480"
          required
        />
      </div>

      {/* Filtri di selezione aula */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Selezione Aula</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro Città */}
          <div className="space-y-2">
            <Label htmlFor="city">Circondario</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona circondario" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Tipo Tribunale */}
          <div className="space-y-2">
            <Label htmlFor="type">Settore</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro Tribunale */}
          <div className="space-y-2">
            <Label htmlFor="tribunale">Autorità Giudiziaria</Label>
            <Select value={selectedTribunale} onValueChange={setSelectedTribunale}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona autorità giudiziaria" />
              </SelectTrigger>
              <SelectContent>
                {tribunali.map((tribunale) => (
                  <SelectItem key={tribunale.id} value={tribunale.id}>
                    {tribunale.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Aula */}
          <div className="space-y-2">
            <Label htmlFor="aula">Aula</Label>
            <Select value={selectedAula} onValueChange={setSelectedAula}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona aula" />
              </SelectTrigger>
              <SelectContent>
                {aule.map((aula) => (
                  <SelectItem key={aula.id} value={aula.id}>
                    {aula.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading} className="bg-canossa-red hover:bg-canossa-red-dark text-white">
          {loading ? 'Creazione...' : 'Crea Udienza'}
        </Button>
      </div>
    </form>
  )
}
