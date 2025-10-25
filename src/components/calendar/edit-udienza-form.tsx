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

type Udienza = Database['public']['Tables']['udienze']['Row'] & {
  aule: Aula
}

interface EditUdienzaFormProps {
  udienza: Udienza
  onSuccess: () => void
  onCancel?: () => void
}

export function EditUdienzaForm({ udienza, onSuccess, onCancel }: EditUdienzaFormProps) {
  const [formData, setFormData] = useState({
    title: udienza.title || '',
    description: udienza.description || '',
    date: udienza.date || '',
    time: udienza.time || '',
    aula_id: udienza.aula_id || '',
  })
  const [loading, setLoading] = useState(false)
  const [tribunali, setTribunali] = useState<Tribunale[]>([])
  const [aule, setAule] = useState<Aula[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTribunale, setSelectedTribunale] = useState<string>('')
  const [selectedAula, setSelectedAula] = useState<string>(udienza.aula_id || '')
  const supabase = createClient()

  useEffect(() => {
    fetchTribunali()
    // Imposta i filtri basati sull'aula corrente
    if (udienza.aule) {
      setSelectedCity(udienza.aule.tribunali.circondario || '')
      setSelectedType(udienza.aule.tribunali.settore || '')
      setSelectedTribunale(udienza.aule.tribunali.id)
    }
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

  const fetchTribunali = async () => {
    try {
      const { data } = await supabase
        .from('tribunali')
        .select('*')
        .order('nome')

      if (data) {
        setTribunali(data)
        const uniqueCities = [...new Set(data.map(t => t.circondario).filter(Boolean))]
        setCities(uniqueCities)
      }
    } catch (error) {
      console.error('Errore nel caricamento dei tribunali:', error)
    }
  }

  const fetchTribunaliByCity = async () => {
    try {
      const { data } = await supabase
        .from('tribunali')
        .select('*')
        .eq('circondario', selectedCity)
        .order('nome')

      if (data) {
        setTribunali(data)
        const uniqueTypes = [...new Set(data.map(t => t.settore).filter(Boolean))]
        // setTypes(uniqueTypes) // Non necessario per ora
      }
    } catch (error) {
      console.error('Errore nel caricamento dei tribunali per città:', error)
    }
  }

  const fetchAuleByTribunale = async () => {
    try {
      const { data } = await supabase
        .from('aule')
        .select(`
          *,
          tribunali (*)
        `)
        .eq('tribunale_id', selectedTribunale)
        .order('nome')

      if (data) {
        setAule(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento delle aule:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date || !formData.time || !formData.aula_id) {
      toast.error('Compila tutti i campi obbligatori')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Utente non autenticato')
        return
      }

      // Carica il profilo per ottenere il nome dell'autore
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
        .update({
          aula_id: formData.aula_id,
          title: formData.title,
          description: formData.description || null,
          date: formData.date,
          time: formData.time,
          status: 'scheduled',
          autore: autore,
        })
        .eq('id', udienza.id)

      if (error) {
        toast.error('Errore nella modifica dell\'udienza: ' + error.message)
      } else {
        toast.success('Udienza modificata con successo!')
        onSuccess()
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
        <Label htmlFor="title">Titolo Udienza *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Inserisci il titolo dell'udienza"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Note</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Aggiungi note o dettagli (opzionale)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Orario *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Filtri di selezione aula */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Selezione Aula</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Circondario</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="type">Settore</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona settore" />
              </SelectTrigger>
              <SelectContent>
                {tribunali
                  .filter(t => t.circondario === selectedCity)
                  .map((tribunale) => (
                    <SelectItem key={tribunale.id} value={tribunale.settore || ''}>
                      {tribunale.settore}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tribunale">Autorità Giudiziaria</Label>
            <Select value={selectedTribunale} onValueChange={setSelectedTribunale}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona autorità" />
              </SelectTrigger>
              <SelectContent>
                {tribunali
                  .filter(t => t.circondario === selectedCity && t.settore === selectedType)
                  .map((tribunale) => (
                    <SelectItem key={tribunale.id} value={tribunale.id}>
                      {tribunale.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aula">Aula *</Label>
            <Select value={selectedAula} onValueChange={(value) => {
              setSelectedAula(value)
              setFormData({ ...formData, aula_id: value })
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona aula" />
              </SelectTrigger>
              <SelectContent>
                {aule.map((aula) => (
                  <SelectItem key={aula.id} value={aula.id}>
                    {aula.nome}
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  )
}
