'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { User, Mail, Phone, Scale, CheckCircle, XCircle, Edit, Save, X } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileManagement() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bar_number: '',
    specialization: [] as string[],
    bio: '',
    phone: '',
    avatar_url: '',
  })
  const [newSpecialization, setNewSpecialization] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Nessun utente autenticato')
        return
      }
      
      console.log('Utente autenticato:', user)

      console.log('Caricamento profilo per user_id:', user.id)
      
      // Prima proviamo a vedere se la tabella profiles esiste
      console.log('Test: caricamento di tutti i profili...')
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      console.log('Tutti i profili:', allProfiles)
      if (allError) {
        console.error('Errore nel caricamento di tutti i profili:', allError)
      }

      // Ora proviamo la query con filtro user_id (senza avatar_url per ora)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, bar_number, specialization, bio, phone, is_verified, created_at, updated_at')
        .eq('user_id', user.id)

      console.log('Risultato query profilo:', { data, error })

      if (error) {
        console.log('Errore nella query profilo:', error)
        console.log('Dettagli errore profilo:', {
          message: error.message || 'Nessun messaggio',
          details: error.details || 'Nessun dettaglio',
          hint: error.hint || 'Nessun suggerimento',
          code: error.code || 'Nessun codice'
        })
        
        // Se l'errore è dovuto al campo avatar_url mancante, proviamo senza
        if (error.message && error.message.includes('avatar_url')) {
          console.log('Tentativo di caricamento senza avatar_url...')
          const { data: profileDataArray, error: profileError } = await supabase
            .from('profiles')
            .select('id, user_id, first_name, last_name, bar_number, specialization, bio, phone, is_verified, created_at, updated_at')
            .eq('user_id', user.id)
          
          if (profileError) {
            console.log('Errore anche senza avatar_url:', profileError)
            toast.error('Errore nel caricamento del profilo: ' + (profileError.message || 'Errore sconosciuto'))
            return
          }
          
          if (profileDataArray && profileDataArray.length > 0) {
            const profileData = profileDataArray[0]
            console.log('Profilo trovato senza avatar_url:', profileData)
            setProfile({ ...profileData, avatar_url: null })
            setFormData({
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              bar_number: profileData.bar_number,
              specialization: profileData.specialization || [],
              bio: profileData.bio || '',
              phone: profileData.phone || '',
              avatar_url: '',
            })
            return
          }
        }
        
        toast.error('Errore nel caricamento del profilo: ' + (error.message || 'Errore sconosciuto'))
        return
      }

      if (data && data.length > 0) {
        const profileData = data[0] // Prendi il primo profilo
        console.log('Profilo trovato:', profileData)
        setProfile({ ...profileData, avatar_url: null })
        setFormData({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          bar_number: profileData.bar_number,
          specialization: profileData.specialization || [],
          bio: profileData.bio || '',
          phone: profileData.phone || '',
          avatar_url: '',
        })
      } else {
        console.log('Nessun profilo trovato per questo utente')
        console.log('Dati ricevuti:', data)
        console.log('Tentativo di creazione profilo dai metadati...')
        
        // Prova a creare il profilo dai metadati dell'utente o da localStorage
        await createProfileFromMetadata()
      }
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error)
      toast.error('Errore imprevisto nel caricamento del profilo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bar_number: formData.bar_number,
          specialization: formData.specialization,
          bio: formData.bio,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        toast.error('Errore nell&apos;aggiornamento del profilo: ' + error.message)
      } else {
        toast.success('Profilo aggiornato con successo!')
        setEditing(false)
        fetchProfile()
      }
    } catch (error) {
      toast.error('Errore imprevisto')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bar_number: profile.bar_number,
        specialization: profile.specialization || [],
        bio: profile.bio || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
      })
    }
    setEditing(false)
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specialization.includes(newSpecialization.trim())) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, newSpecialization.trim()]
      })
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (specialization: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter(s => s !== specialization)
    })
  }

  const createProfileFromMetadata = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Utente non autenticato')
        return
      }

      console.log('Creazione profilo dai metadati per user_id:', user.id)
      console.log('Metadati utente:', user.user_metadata)
      
      // Controlla se ci sono dati in localStorage
      const pendingProfile = localStorage.getItem('pendingProfile')
      let profileData: {
        first_name?: string;
        last_name?: string;
        bar_number?: string;
        specialization?: string[];
        phone?: string;
      } = {}
      
      if (pendingProfile) {
        console.log('Dati profilo trovati in localStorage:', JSON.parse(pendingProfile))
        profileData = JSON.parse(pendingProfile)
        // Rimuovi i dati da localStorage dopo averli usati
        localStorage.removeItem('pendingProfile')
      } else {
        // Usa i metadati dell'utente come fallback
        profileData = {
          first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          bar_number: user.user_metadata?.bar_number || '',
          specialization: user.user_metadata?.specializations || [],
          phone: user.user_metadata?.phone_number || '',
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          bar_number: profileData.bar_number || '',
          specialization: profileData.specialization || [],
          bio: '',
          phone: profileData.phone || '',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Errore nella creazione del profilo dai metadati:', error)
        toast.error('Errore nella creazione del profilo: ' + error.message)
        return
      }

      if (data) {
        console.log('Profilo creato dai metadati:', data)
        setProfile({ ...data, avatar_url: null })
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          bar_number: data.bar_number,
          specialization: data.specialization || [],
          bio: data.bio || '',
          phone: data.phone || '',
          avatar_url: '',
        })
        toast.success('Profilo creato automaticamente dai dati di registrazione!')
      }
    } catch (error) {
      console.error('Errore nella creazione del profilo dai metadati:', error)
      toast.error('Errore imprevisto nella creazione del profilo')
    }
  }

  const createProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Utente non autenticato')
        return
      }

      console.log('Creazione profilo per user_id:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          bar_number: '',
          specialization: [],
          bio: '',
          phone: '',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Errore nella creazione del profilo:', error)
        toast.error('Errore nella creazione del profilo: ' + error.message)
        return
      }

      if (data) {
        console.log('Profilo creato:', data)
        setProfile({ ...data, avatar_url: null })
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          bar_number: data.bar_number,
          specialization: data.specialization || [],
          bio: data.bio || '',
          phone: data.phone || '',
          avatar_url: '',
        })
        toast.success('Profilo creato con successo!')
      }
    } catch (error) {
      console.error('Errore nella creazione del profilo:', error)
      toast.error('Errore imprevisto nella creazione del profilo')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profilo Non Trovato</h3>
        <p className="text-gray-500 mb-4">Il tuo profilo non è stato trovato. Crea un nuovo profilo per iniziare.</p>
        <Button onClick={createProfile} className="bg-blue-600 hover:bg-blue-700">
          <User className="mr-2 h-4 w-4" />
          Crea Profilo
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="hidden lg:block text-2xl font-bold text-gray-900">Gestione Profilo</h2>
        </div>
        <div className="flex space-x-2">
          {editing ? (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Salva
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Annulla
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informazioni principali */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="lg:pb-6 pb-2">
              <CardTitle className="hidden lg:block">Informazioni Personali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Foto Profilo */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 overflow-hidden flex items-center justify-center" style={{ borderColor: 'var(--canossa-red)', backgroundColor: 'var(--canossa-subtle-bg)' }}>
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Foto profilo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center" style={{ color: 'var(--canossa-red)' }}>
                          <span className="text-3xl font-bold">
                            {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informazioni utente */}
                <div className="flex-1">
                  <p className="text-2xl font-bold mb-3" style={{ color: 'var(--canossa-red)' }}>
                    Avv. {profile.first_name} {profile.last_name}
                  </p>
                  <Badge className={`${profile.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-sm px-3 py-1`}>
                    {profile.is_verified ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verificato
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        In Attesa di Verifica
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome</Label>
                  {editing ? (
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Cognome</Label>
                  {editing ? (
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.last_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bar_number">Numero di Iscrizione all&apos;Albo</Label>
                  {editing ? (
                    <Input
                      id="bar_number"
                      value={formData.bar_number}
                      onChange={(e) => setFormData({ ...formData, bar_number: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.bar_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.phone || 'Non specificato'}</p>
                  )}
                </div>

              </div>

              <div className="space-y-2">
                <Label>Specializzazioni</Label>
                {editing ? (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Aggiungi specializzazione"
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                      />
                      <Button onClick={addSpecialization} size="sm">
                        Aggiungi
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          <span>{spec}</span>
                          <button
                            onClick={() => removeSpecialization(spec)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.specialization?.map((spec, index) => (
                      <Badge key={index} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Racconta la tua esperienza professionale..."
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile.bio || 'Nessuna biografia disponibile'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiche e info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stato Verifica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {profile.is_verified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm">
                    {profile.is_verified ? 'Profilo Verificato' : 'In Attesa di Verifica'}
                  </span>
                </div>
                {!profile.is_verified && (
                  <p className="text-xs text-gray-500">
                    Il tuo profilo sarà verificato entro 24-48 ore dalla registrazione.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informazioni Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Email verificata</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Scale className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Iscritto all&apos;albo</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Membro dal {new Date(profile.created_at).toLocaleDateString('it-IT')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
