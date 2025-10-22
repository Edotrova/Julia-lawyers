'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Send, Users, MessageSquare, Search, MapPin, Building, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database'

type Message = Database['public']['Tables']['messages']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  chat_rooms?: Database['public']['Tables']['chat_rooms']['Row']
}

type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'] & {
  aule: Database['public']['Tables']['aule']['Row'] & {
    tribunali: Database['public']['Tables']['tribunali']['Row']
  }
}

type Profile = Database['public']['Tables']['profiles']['Row']

interface ChatInterfaceProps {
  selectedUserId?: string | null
  selectedRoomId?: string | null
}

export function ChatInterface({ selectedUserId, selectedRoomId }: ChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'private'>('rooms')
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [openChats, setOpenChats] = useState<{userId: string, lastMessage: string, timestamp: string, profile?: any}[]>([])
  const [openChatRooms, setOpenChatRooms] = useState<{roomId: string, lastMessage: string, timestamp: string, city: string, tribunale: string, aula: string}[]>([])
  
  // Filtri per chat delle aule
  const [tribunali, setTribunali] = useState<any[]>([])
  const [aule, setAule] = useState<any[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTribunale, setSelectedTribunale] = useState<string>('')
  const [selectedAula, setSelectedAula] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
    fetchChatRooms()
    fetchTribunali()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadOpenChats()
      loadOpenChatRooms()
    }
  }, [currentUser])

  // Gestione selezione automatica utente da URL
  useEffect(() => {
    if (selectedUserId && selectedUserId !== currentUser) {
      setActiveTab('private')
      setSelectedUser(selectedUserId)
      setSelectedRoom('')
    }
  }, [selectedUserId, currentUser])

  // Gestione selezione automatica room da URL
  useEffect(() => {
    if (selectedRoomId) {
      setActiveTab('rooms')
      setSelectedRoom(selectedRoomId)
      setSelectedUser('')
    }
  }, [selectedRoomId])

  // Carica messaggi quando selectedUser cambia
  useEffect(() => {
    if (selectedUser && currentUser) {
      console.log('🔄 Caricamento messaggi per utente selezionato:', { selectedUser, currentUser })
      fetchMessages(selectedUser, 'private')
      markMessagesAsRead(selectedUser, 'private')
    } else {
      console.log('⏳ In attesa di currentUser o selectedUser:', { selectedUser, currentUser })
    }
  }, [selectedUser, currentUser])

  // Carica chat aperte dal database
  const loadOpenChats = async () => {
    if (!currentUser) return
    
    try {
      // Carica le ultime chat private dell'utente
      const { data: recentChats, error } = await supabase
        .from('messages')
        .select(`
          receiver_id,
          sender_id,
          content,
          created_at
        `)
        .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
        .eq('message_type', 'private')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Raggruppa per conversazione e prendi l'ultimo messaggio
      const chatMap = new Map()
      
      recentChats?.forEach((message) => {
        const otherUserId = message.sender_id === currentUser ? message.receiver_id : message.sender_id
        
        if (!chatMap.has(otherUserId)) {
          chatMap.set(otherUserId, {
            userId: otherUserId,
            lastMessage: message.content,
            timestamp: format(new Date(message.created_at), 'HH:mm'),
            profile: null // Sarà caricato separatamente
          })
        }
      })

      // Carica i profili per gli utenti delle chat
      const userIds = Array.from(chatMap.keys())
      console.log('🔍 User IDs dalle chat:', userIds)
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds)

        console.log('👥 Profili caricati:', profiles)
        console.log('❌ Errore profili:', profilesError)

        if (!profilesError && profiles) {
          // Aggiorna le chat con i profili
          const updatedChats = Array.from(chatMap.values()).map(chat => {
            const profile = profiles.find(p => p.user_id === chat.userId)
            console.log(`🔗 Chat ${chat.userId} -> Profilo:`, profile)
            return {
              ...chat,
              profile: profile || null
            }
          })
          console.log('✅ Chat aggiornate con profili:', updatedChats)
          setOpenChats(updatedChats)
          return
        }
      }

      // Se non ci sono profili, mostra comunque le chat senza profili
      setOpenChats(Array.from(chatMap.values()))
    } catch (error) {
      console.error('Errore caricamento chat:', error)
    }
  }

  // Carica chat aule aperte dal database
  const loadOpenChatRooms = async () => {
    if (!currentUser) return
    
    try {
      // Carica le ultime chat aule dell'utente
      const { data: recentChatRooms, error } = await supabase
        .from('messages')
        .select(`
          chat_room_id,
          content,
          created_at,
          chat_rooms!inner(
            aula_id,
            name
          )
        `)
        .eq('message_type', 'room')
        .not('chat_room_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      console.log('🔍 Chat rooms caricate:', recentChatRooms)
      console.log('🔍 Numero di chat rooms:', recentChatRooms?.length)

      // Raggruppa per chat room e prendi l'ultimo messaggio
      const chatRoomMap = new Map()
      
      recentChatRooms?.forEach((message, index) => {
        console.log(`🔍 Messaggio ${index}:`, {
          chat_room_id: message.chat_room_id,
          content: message.content,
          chat_rooms: message.chat_rooms
        })
        
        const roomId = message.chat_room_id
        const roomData = message.chat_rooms
        
        console.log('🔍 Room data:', roomData)
        console.log('🔍 Room data.name:', (roomData as any)?.name)
        
        if (!chatRoomMap.has(roomId)) {
          // Usa il nome dalla tabella chat_rooms e rimuovi i primi 5 caratteri ("Chat ")
          const roomName = (roomData as any)?.name || 'Aula'
          const aulaName = roomName.startsWith('Chat ') ? roomName.substring(5) : roomName
          
          console.log('🔍 Room name:', roomName)
          console.log('🔍 Aula name:', aulaName)
          
          chatRoomMap.set(roomId, {
            roomId: roomId,
            lastMessage: message.content,
            timestamp: format(new Date(message.created_at), 'HH:mm'),
            city: 'N/A', // Per ora usiamo N/A, potremmo aggiungere logica per estrarre città se necessario
            tribunale: 'N/A', // Per ora usiamo N/A, potremmo aggiungere logica per estrarre tribunale se necessario
            aula: aulaName
          })
        }
      })
      
      console.log('🔍 Chat room map finale:', Array.from(chatRoomMap.values()))

      setOpenChatRooms(Array.from(chatRoomMap.values()))
    } catch (error) {
      console.error('Errore caricamento chat aule:', error)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchProfiles()
    }
  }, [currentUser])

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

  // Rimosso l'useEffect che apriva automaticamente la chat quando si selezionava l'aula
  // Ora l'utente deve cliccare esplicitamente su 'Vai alla chat'

  // Funzione per validare che tutti i parametri siano selezionati
  const areAllParametersSelected = () => {
    return selectedCity && selectedType && selectedTribunale && selectedAula
  }

  // Funzione per andare alla chat dell'aula selezionata
  const goToAulaChat = async () => {
    if (!areAllParametersSelected()) {
      toast.error('Seleziona tutti i parametri prima di accedere alla chat')
      return
    }

    try {
      setLoading(true)
      // Carica le chat rooms per l'aula selezionata
      const { data } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          aule (
            *,
            tribunali (*)
          )
        `)
        .eq('aula_id', selectedAula)

      if (data && data.length > 0) {
        setChatRooms(data)
        setSelectedRoom(data[0].id)
        toast.success('Accesso alla chat effettuato!')
      } else {
        toast.error('Nessuna chat trovata per questa aula')
      }
    } catch (error) {
      console.error('Errore nell\'accesso alla chat:', error)
      toast.error('Errore nell\'accesso alla chat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom, 'room')
      markMessagesAsRead(selectedRoom, 'room')
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Verifica se il messaggio è rilevante per la chat corrente
          const isRelevantMessage = 
            (activeTab === 'rooms' && newMessage.chat_room_id === selectedRoom) ||
            (activeTab === 'private' && (
              (newMessage.sender_id === currentUser && newMessage.receiver_id === selectedUser) ||
              (newMessage.sender_id === selectedUser && newMessage.receiver_id === currentUser)
            ))
          
          if (isRelevantMessage) {
            // Carica i dati del profilo per il nuovo messaggio
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', newMessage.sender_id)
              .single()
              .then(({ data: profileData, error: profileError }) => {
                if (profileError) {
                  console.error('❌ Errore nel caricamento del profilo per messaggio in tempo reale:', profileError)
                }
                const messageWithProfile = {
                  ...newMessage,
                  profiles: profileData
                }
                setMessages(prev => [...prev, messageWithProfile])
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, activeTab, selectedRoom, selectedUser])

  const getCurrentUser = async () => {
    try {
      console.log('🔍 Recupero utente corrente...')
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 Utente recuperato:', user?.id)
      setCurrentUser(user?.id || null)
    } catch (error) {
      console.error('❌ Errore nel recupero utente:', error)
    }
  }


  const fetchTribunali = async () => {
    try {
      const { data } = await supabase
        .from('tribunali')
        .select('*')
        .order('city')

      setTribunali(data || [])
      
      // Estrai le città uniche
      const uniqueCities = [...new Set(data?.map(t => t.city) || [])]
      setCities(uniqueCities)
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
      
      // Reset dei valori dipendenti quando si cambia città
      setSelectedType('')
      setSelectedTribunale('')
      setSelectedAula('')
      setAule([])
      setChatRooms([])
      setSelectedRoom('')
      
      // Non auto-selezionare più i valori per evitare apertura automatica
      // L'utente deve selezionare manualmente tutti i parametri
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
      
      // Reset dei valori dipendenti quando si cambia tribunale
      setSelectedAula('')
      setChatRooms([])
      setSelectedRoom('')
      
      // Non auto-selezionare più l'aula per evitare apertura automatica
      // L'utente deve selezionare manualmente l'aula
    } catch (error) {
      console.error('Errore nel caricamento delle aule:', error)
    }
  }

  const fetchChatRoomsByAula = async () => {
    if (!selectedAula) return

    try {
      setLoading(true)
      const { data } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          aule (
            *,
            tribunali (*)
          )
        `)
        .eq('aula_id', selectedAula)

      setChatRooms(data || [])
      
      if (data && data.length > 0) {
        setSelectedRoom(data[0].id)
      } else {
        // Se non ci sono chat rooms, mostra un messaggio informativo
        console.log('📝 Nessuna chat room trovata per questa aula')
      }
    } catch (error) {
      console.error('Errore nel caricamento delle chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatRooms = async () => {
    try {
      setLoading(true)
      
      // Se c'è un'aula selezionata, mostra solo le chat di quell'aula
      if (selectedAula) {
        const { data } = await supabase
          .from('chat_rooms')
          .select(`
            *,
            aule (
              *,
              tribunali (*)
            )
          `)
          .eq('aula_id', selectedAula)
          .order('created_at', { ascending: false })

        setChatRooms(data || [])
        
        if (data && data.length > 0) {
          setSelectedRoom(data[0].id)
        }
      } else {
        // Se non c'è aula selezionata, non mostrare chat rooms
        setChatRooms([])
        setSelectedRoom('')
      }
    } catch (error) {
      console.error('Errore nel caricamento delle chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }


  const fetchProfiles = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('last_name')

      // Filtra l'utente corrente se disponibile
      const filteredProfiles = currentUser 
        ? data?.filter(profile => profile.user_id !== currentUser) || []
        : data || []

      setProfiles(filteredProfiles)
    } catch (error) {
      console.error('Errore nel caricamento dei profili:', error)
    }
  }

  const fetchMessages = async (id: string, type: 'room' | 'private') => {
    try {
      setLoading(true)
      
      // Controlli di sicurezza
      if (!id) {
        console.error('❌ ID non valido per il caricamento messaggi')
        setMessages([])
        setLoading(false)
        return
      }
      
      if (type === 'private' && !currentUser) {
        console.error('❌ Utente corrente non disponibile per messaggi privati')
        setMessages([])
        setLoading(false)
        return
      }
      
      let query = supabase
        .from('messages')
        .select('*')

      if (type === 'room') {
        query = query.eq('chat_room_id', id)
        const { data: messages, error } = await query.order('created_at', { ascending: true })
        
        if (error) {
          console.error('❌ Errore nella query messaggi room:', error)
          setMessages([])
          return
        }
        
        console.log('📥 Messaggi room caricati:', { count: messages?.length || 0 })
        
        // Carica i profili per tutti i sender_id unici
        const uniqueSenderIds = [...new Set((messages || []).map(msg => msg.sender_id))]
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', uniqueSenderIds)

        if (profilesError) {
          console.error('❌ Errore nel caricamento dei profili room:', profilesError)
          setMessages(messages || [])
          return
        }

        // Combina i messaggi con i profili
        const messagesWithProfiles = (messages || []).map(message => ({
          ...message,
          profiles: profiles?.find(profile => profile.user_id === message.sender_id) || null
        }))

        console.log('📥 Messaggi room con profili:', { count: messagesWithProfiles.length })
        setMessages(messagesWithProfiles)
      } else {
        // Per i messaggi privati, usa due query separate e combina i risultati
        console.log('🔍 Caricamento messaggi privati:', { currentUser, selectedUser: id })
        
        // Query 1: messaggi dove currentUser è mittente
        const { data: sentMessages, error: sentError } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', currentUser)
          .eq('receiver_id', id)
          .order('created_at', { ascending: true })
        
        // Query 2: messaggi dove currentUser è destinatario  
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', id)
          .eq('receiver_id', currentUser)
          .order('created_at', { ascending: true })
        
        if (sentError || receivedError) {
          console.error('❌ Errore nelle query messaggi privati:', { sentError, receivedError })
          setMessages([])
          return
        }
        
        // Combina e ordina i messaggi
        const allMessages = [...(sentMessages || []), ...(receivedMessages || [])]
        allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        console.log('📥 Messaggi privati caricati:', { count: allMessages.length, messages: allMessages })
        
        // Carica i profili per tutti i sender_id unici
        const uniqueSenderIds = [...new Set(allMessages.map(msg => msg.sender_id))]
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', uniqueSenderIds)

        if (profilesError) {
          console.error('❌ Errore nel caricamento dei profili:', profilesError)
          setMessages(allMessages)
          return
        }

        // Combina i messaggi con i profili
        const messagesWithProfiles = allMessages.map(message => ({
          ...message,
          profiles: profiles?.find(profile => profile.user_id === message.sender_id) || null
        }))

        console.log('📥 Messaggi con profili:', { count: messagesWithProfiles.length })
        setMessages(messagesWithProfiles)
      }
    } catch (error) {
      console.error('Errore nel caricamento dei messaggi:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) {
      console.log('❌ Invio messaggio bloccato:', { 
        hasMessage: !!newMessage.trim(), 
        hasCurrentUser: !!currentUser,
        activeTab,
        selectedRoom,
        selectedUser
      })
      return
    }

    const messageContent = newMessage.trim()
    console.log('📤 Invio messaggio:', { messageContent, activeTab, selectedRoom, selectedUser })
    setNewMessage('') // Pulisci l'input immediatamente

    try {
      const messageData: {
        sender_id: string;
        content: string;
        message_type: 'room' | 'private';
        chat_room_id?: string;
        receiver_id?: string;
        read: boolean;
      } = {
        sender_id: currentUser,
        content: messageContent,
        message_type: activeTab === 'rooms' ? 'room' : 'private',
        read: false,
      }

      if (activeTab === 'rooms' && selectedRoom) {
        messageData.chat_room_id = selectedRoom
      } else if (activeTab === 'private' && selectedUser) {
        messageData.receiver_id = selectedUser
      }

      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('*')
        .single()

      if (error) {
        console.error('❌ Errore invio messaggio:', error)
        toast.error('Errore nell\'invio del messaggio: ' + error.message)
        setNewMessage(messageContent) // Ripristina il messaggio in caso di errore
      } else {
        console.log('✅ Messaggio inviato con successo:', insertedMessage)
        
        // Ricarica chat aperte dopo invio messaggio
        if (activeTab === 'private' && selectedUser) {
          loadOpenChats()
        } else if (activeTab === 'rooms' && selectedRoom) {
          loadOpenChatRooms()
        }
        
        // Carica il profilo del mittente
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', insertedMessage.sender_id)
          .single()

        // Crea il messaggio completo con il profilo
        const messageWithProfile = {
          ...insertedMessage,
          profiles: profile
        }
        
        // Aggiungi il messaggio alla lista locale
        setMessages(prev => [...prev, messageWithProfile])
      }
    } catch (error) {
      toast.error('Errore imprevisto')
      setNewMessage(messageContent) // Ripristina il messaggio in caso di errore
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markMessagesAsRead = async (id: string, type: 'room' | 'private') => {
    if (!currentUser) return

    try {
      if (type === 'room') {
        // Per le chat di gruppo, marca come letti tutti i messaggi della room
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('chat_room_id', id)
          .neq('sender_id', currentUser)
      } else {
        // Per le chat private, marca come letti i messaggi ricevuti
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiver_id', currentUser)
          .eq('sender_id', id)
      }
    } catch (error) {
      console.error('Errore nel marcare i messaggi come letti:', error)
    }
  }

  const getSelectedRoom = () => {
    return chatRooms.find(room => room.id === selectedRoom)
  }

  const getSelectedProfile = () => {
    return profiles.find(profile => profile.user_id === selectedUser)
  }

  const getFilteredProfiles = () => {
    if (!searchTerm.trim()) return profiles
    
    return profiles.filter(profile => 
      profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.bar_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const isMyMessage = (message: Message) => {
    return message.sender_id === currentUser
  }

  if (loading && chatRooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rooms' | 'private')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rooms" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Chat Aule</span>
            <span className="sm:hidden">Aule</span>
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Chat Private</span>
            <span className="sm:hidden">Private</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          {!selectedRoom ? (
            <div className="w-full">
              <Card>
                <CardHeader className="lg:pb-4 pb-2">
                  <CardTitle className="hidden lg:block text-lg font-semibold">
                    Chat Aule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 4 parametri input */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Circondario</Label>
                      <Select value={selectedCity} onValueChange={(value) => {
                        setSelectedCity(value)
                        setSelectedType('')
                        setSelectedTribunale('')
                        setSelectedAula('')
                        setSelectedRoom('')
                      }}>
                        <SelectTrigger className="h-10">
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
                    <div>
                      <Label className="text-sm font-medium">Settore</Label>
                      <Select 
                        value={selectedType} 
                        onValueChange={(value) => {
                          setSelectedType(value)
                          setSelectedTribunale('')
                          setSelectedAula('')
                          setSelectedRoom('')
                        }}
                        disabled={!selectedCity}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleziona settore" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="penale">Penale</SelectItem>
                          <SelectItem value="civile">Civile</SelectItem>
                          <SelectItem value="amministrativo">Amministrativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Autorità Giudiziaria</Label>
                      <Select 
                        value={selectedTribunale} 
                        onValueChange={(value) => {
                          setSelectedTribunale(value)
                          setSelectedAula('')
                          setSelectedRoom('')
                        }}
                        disabled={!selectedType}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleziona autorità giudiziaria" />
                        </SelectTrigger>
                        <SelectContent>
                          {tribunali
                            .filter(t => t.type === selectedType)
                            .map((tribunale) => (
                            <SelectItem key={tribunale.id} value={tribunale.id}>
                              {tribunale.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Aula</Label>
                      <Select 
                        value={selectedAula} 
                        onValueChange={(value) => {
                          setSelectedAula(value)
                          setSelectedRoom('')
                        }}
                        disabled={!selectedTribunale}
                      >
                        <SelectTrigger className="h-10">
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

                  {/* Chat aule aperte - direttamente sotto */}
                  {openChatRooms.length > 0 && (
                    <div className="space-y-2">
                      {openChatRooms.map((chat) => (
                        <div 
                          key={chat.roomId}
                          className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                            selectedRoom === chat.roomId 
                              ? 'bg-canossa-subtle-bg border-canossa-red' 
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedRoom(chat.roomId)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarFallback className="text-sm bg-canossa-red text-white">
                                {chat.aula?.[0]}{chat.aula?.[1]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm text-gray-900 truncate">
                                    {chat.aula}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate mt-1">
                                    {chat.lastMessage}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {chat.timestamp}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pulsante vai alla chat */}
                  {areAllParametersSelected() && (
                    <div className="pt-2">
                      <Button
                        onClick={goToAulaChat}
                        className="w-full click-red-shadow"
                        size="sm"
                        disabled={loading}
                      >
                        {loading ? 'Caricamento...' : 'Vai alla Chat'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Chat aule selezionata - solo chat con pulsante indietro */
            <div className="w-full">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRoom('')}
                        className="mr-2 p-1"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <CardTitle className="text-lg">
                        {(() => {
                          const room = chatRooms.find(room => room.id === selectedRoom)
                          if (room?.name) {
                            return room.name
                          }
                          // Se non trovata in chatRooms, cerca in openChatRooms
                          const openRoom = openChatRooms.find(room => room.roomId === selectedRoom)
                          if (openRoom?.aula) {
                            return `Chat ${openRoom.aula}`
                          }
                          return 'Chat Aula'
                        })()}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messaggi */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            isMyMessage(message)
                              ? 'bg-canossa-red text-white'
                              : 'bg-gray-100 text-gray-900 canossa-border-accent'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.profiles?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {message.profiles?.first_name?.[0]}{message.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {message.profiles?.first_name} {message.profiles?.last_name}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {format(new Date(message.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input messaggio */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Scrivi un messaggio..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()} className="click-red-shadow">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          {!selectedUser ? (
            <div className="w-full">
              <Card>
                <CardHeader className="lg:pb-4 pb-2">
                  <CardTitle className="hidden lg:block text-lg font-semibold">
                    Cerca colleghi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Searchbar con ref per gestire click fuori */}
                  <div ref={searchContainerRef}>
                    <Input
                      placeholder="Cerca per nome o numero di iscrizione..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                    
                    {/* Risultati ricerca */}
                    {searchTerm.trim() && getFilteredProfiles().length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
                      {getFilteredProfiles().map((profile) => (
                        <div
                          key={profile.user_id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser === profile.user_id 
                              ? 'bg-canossa-subtle-bg border border-canossa-red' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setSelectedUser(profile.user_id)
                            setSearchTerm('') // Chiudi i risultati di ricerca
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="text-sm">
                                {profile.first_name[0]}{profile.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {profile.first_name} {profile.last_name}
                              </div>
                              <div className="text-xs text-gray-600">
                                Avv. {profile.bar_number}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>

                  {/* Chat aperte - direttamente sotto */}
                  {openChats.length > 0 && (
                    <div className="space-y-2">
                      {openChats.map((chat) => (
                        <div 
                          key={chat.userId}
                          className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                            selectedUser === chat.userId 
                              ? 'bg-canossa-subtle-bg border-canossa-red' 
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedUser(chat.userId)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarFallback className="text-sm bg-canossa-red text-white">
                                {chat.profile?.first_name?.[0]}{chat.profile?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm text-gray-900 truncate">
                                    {chat.profile?.first_name} {chat.profile?.last_name}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate mt-1">
                                    {chat.lastMessage}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {chat.timestamp}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          ) : (
            /* Chat selezionata - solo chat con pulsante indietro */
            <div className="w-full">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedUser('')}
                        className="p-1"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <div>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Chat con {getSelectedProfile()?.first_name} {getSelectedProfile()?.last_name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messaggi */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              isMyMessage(message)
                                ? 'bg-canossa-red text-white'
                                : 'bg-gray-100 text-gray-900 canossa-border-accent'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input messaggio */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Scrivi un messaggio..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()} className="click-red-shadow">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}