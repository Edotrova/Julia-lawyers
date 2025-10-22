'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    barNumber: '',
    specialization: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [lastAttempt, setLastAttempt] = useState<number>(0)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Controlla se è passato abbastanza tempo dall'ultimo tentativo
    const now = Date.now()
    if (now - lastAttempt < 5000) { // 5 secondi di cooldown
      toast.error('Aspetta qualche secondo prima di riprovare')
      return
    }
    
    setLastAttempt(now)
    setLoading(true)
    
    // Debug: mostra i dati del form
    console.log('Dati del form:', formData)
    
    // Aggiungi un piccolo delay per evitare troppi tentativi rapidi
    await new Promise(resolve => setTimeout(resolve, 500))

    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono')
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            bar_number: formData.barNumber,
            specializations: formData.specialization.split(',').map(s => s.trim()).filter(s => s.length > 0).join(','),
            phone_number: formData.phone,
            bio: '',
            avatar_url: null
          }
        }
      })

      if (authError) {
        console.error('Errore durante la registrazione:', authError)
        toast.error('Errore durante la registrazione: ' + authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        console.log('Utente creato:', authData.user)
        
        // Crea il profilo manualmente
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              bar_number: formData.barNumber,
              specialization: formData.specialization.split(',').map(s => s.trim()).filter(s => s.length > 0),
              bio: '',
              phone: formData.phone,
              is_verified: false
            })

          if (profileError) {
            console.error('Errore creazione profilo:', profileError)
            // Non bloccare la registrazione se il profilo fallisce
          } else {
            console.log('Profilo creato con successo')
          }
        } catch (profileErr) {
          console.error('Errore nella creazione del profilo:', profileErr)
        }
        
        // Se l'email non è confermata, mostra un messaggio diverso
        if (authData.user.email_confirmed_at) {
          toast.success('Registrazione completata! Puoi ora accedere.')
          router.push('/')
        } else {
          toast.success('Registrazione completata! Controlla la tua email per verificare l\'account.')
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Errore durante la registrazione:', error)
      toast.error('Errore imprevisto durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registrati</CardTitle>
        <CardDescription>
          Crea il tuo account da avvocato
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Cognome</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barNumber">Numero di iscrizione all&apos;albo</Label>
            <Input
              id="barNumber"
              value={formData.barNumber}
              onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specializzazioni (separate da virgola)</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="es. Diritto Penale, Diritto Civile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registrazione...' : 'Registrati'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
