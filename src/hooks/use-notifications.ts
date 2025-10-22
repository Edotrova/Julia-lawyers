'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Message = Database['public']['Tables']['messages']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  chat_rooms?: Database['public']['Tables']['chat_rooms']['Row']
}

interface Notification {
  id: string
  type: 'message'
  title: string
  message: string
  sender_id: string
  sender_name: string
  chat_room_id?: string
  receiver_id?: string
  created_at: string
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchNotifications()
      subscribeToNotifications()
    }
  }, [currentUser])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user?.id || null)
    } catch (error) {
      console.error('Errore nel recupero utente:', error)
    }
  }

  const fetchNotifications = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      // Carica i messaggi non letti (ricevuti ma non letti)
      // Prima prova con il campo read, se fallisce usa tutti i messaggi
      let unreadMessages: Database['public']['Tables']['messages']['Row'][] = []
      let error: Error | null = null

      try {
        const { data, error: readError } = await supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', currentUser)
          .or('read.is.null,read.eq.false')
          .order('created_at', { ascending: false })
        
        if (readError && readError.code === 'PGRST200') {
          // Campo read non esiste, carica tutti i messaggi
          console.log('⚠️ Campo read non trovato, caricamento di tutti i messaggi')
          const { data: allMessages, error: allError } = await supabase
            .from('messages')
            .select('*')
            .eq('receiver_id', currentUser)
            .order('created_at', { ascending: false })
          
          unreadMessages = allMessages || []
          error = allError
        } else {
          unreadMessages = data || []
          error = readError
        }
      } catch (err) {
        console.error('Errore nel caricamento dei messaggi:', err)
        error = err instanceof Error ? err : new Error(String(err))
      }

      if (error) {
        console.error('Errore nel caricamento delle notifiche:', error)
        return
      }

      console.log('📥 Notifiche caricate:', { 
        count: unreadMessages?.length || 0, 
        messages: unreadMessages?.map(m => ({ id: m.id, read: m.read, content: m.content }))
      })

      if (!unreadMessages || unreadMessages.length === 0) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      // Carica i profili dei mittenti
      const uniqueSenderIds = [...new Set(unreadMessages.map(msg => msg.sender_id))]
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', uniqueSenderIds)

      if (profilesError) {
        console.error('Errore nel caricamento dei profili per le notifiche:', profilesError)
        setNotifications([])
        setUnreadCount(0)
        return
      }

      // Carica i dettagli delle chat rooms per i messaggi di gruppo
      const chatRoomIds = unreadMessages
        .filter(msg => msg.chat_room_id)
        .map(msg => msg.chat_room_id)
        .filter((id, index, self) => self.indexOf(id) === index)

      let chatRooms: Database['public']['Tables']['chat_rooms']['Row'][] = []
      if (chatRoomIds.length > 0) {
        const { data: roomsData } = await supabase
          .from('chat_rooms')
          .select('*')
          .in('id', chatRoomIds)
        chatRooms = roomsData || []
      }

      // Converti i messaggi in notifiche
      const notificationList: Notification[] = unreadMessages.map(msg => {
        const profile = profiles?.find(p => p.user_id === msg.sender_id)
        const chatRoom = chatRooms.find(r => r.id === msg.chat_room_id)
        
        return {
          id: msg.id,
          type: 'message',
          title: msg.message_type === 'private' 
            ? `Nuovo messaggio da ${profile?.first_name} ${profile?.last_name}`
            : `Nuovo messaggio in ${chatRoom?.name}`,
          message: msg.content,
          sender_id: msg.sender_id,
          sender_name: `${profile?.first_name} ${profile?.last_name}`,
          chat_room_id: msg.chat_room_id || undefined,
          receiver_id: msg.receiver_id || undefined,
          created_at: msg.created_at,
          read: false
        }
      })

      setNotifications(notificationList)
      setUnreadCount(notificationList.length)
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    if (!currentUser) return

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Verifica se il messaggio è per l'utente corrente
          if (newMessage.receiver_id === currentUser) {
            // Carica il profilo del mittente
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', newMessage.sender_id)
              .single()
              .then(({ data: profileData, error: profileError }) => {
                if (profileError) {
                  console.error('Errore nel caricamento del profilo per notifica:', profileError)
                  return
                }

                // Se è un messaggio di gruppo, carica anche i dettagli della chat room
                if (newMessage.chat_room_id) {
                  supabase
                    .from('chat_rooms')
                    .select('*')
                    .eq('id', newMessage.chat_room_id)
                    .single()
                    .then(({ data: chatRoomData }) => {
                      const notification: Notification = {
                        id: newMessage.id,
                        type: 'message',
                        title: newMessage.message_type === 'private' 
                          ? `Nuovo messaggio da ${profileData?.first_name} ${profileData?.last_name}`
                          : `Nuovo messaggio in ${chatRoomData?.name}`,
                        message: newMessage.content,
                        sender_id: newMessage.sender_id,
                        sender_name: `${profileData?.first_name} ${profileData?.last_name}`,
                        chat_room_id: newMessage.chat_room_id || undefined,
                        receiver_id: newMessage.receiver_id || undefined,
                        created_at: newMessage.created_at,
                        read: false
                      }

                      setNotifications(prev => [notification, ...prev])
                      setUnreadCount(prev => prev + 1)
                    })
                } else {
                  // Messaggio privato
                  const notification: Notification = {
                    id: newMessage.id,
                    type: 'message',
                    title: `Nuovo messaggio da ${profileData?.first_name} ${profileData?.last_name}`,
                    message: newMessage.content,
                    sender_id: newMessage.sender_id,
                    sender_name: `${profileData?.first_name} ${profileData?.last_name}`,
                    chat_room_id: newMessage.chat_room_id || undefined,
                    receiver_id: newMessage.receiver_id || undefined,
                    created_at: newMessage.created_at,
                    read: false
                  }

                  setNotifications(prev => [notification, ...prev])
                  setUnreadCount(prev => prev + 1)
                }
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('🔖 Marcatura messaggio come letto:', notificationId)
      
      // Aggiorna il messaggio come letto
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        if (error.code === 'PGRST200') {
          console.log('⚠️ Campo read non esiste, rimozione locale della notifica')
          // Se il campo read non esiste, rimuovi solo localmente
          setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
          setUnreadCount(prev => Math.max(0, prev - 1))
          return
        }
        console.error('❌ Errore nel marcare come letto:', error)
        return
      }

      console.log('✅ Messaggio marcato come letto con successo')

      // Verifica se l'aggiornamento è andato a buon fine
      const { data: updatedMessage, error: verifyError } = await supabase
        .from('messages')
        .select('read')
        .eq('id', notificationId)
        .single()

      if (verifyError) {
        console.error('❌ Errore nella verifica dell\'aggiornamento:', verifyError)
      } else {
        console.log('🔍 Verifica aggiornamento:', { 
          id: notificationId, 
          read: updatedMessage?.read,
          success: updatedMessage?.read === true 
        })
        
        // Se l'aggiornamento non è andato a buon fine, rimuovi solo localmente
        if (updatedMessage?.read !== true) {
          console.log('⚠️ Aggiornamento database fallito, rimozione locale')
          setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
          setUnreadCount(prev => Math.max(0, prev - 1))
          return
        }
      }

      // Aggiorna lo stato locale
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Ricarica le notifiche per assicurarsi che la persistenza sia corretta
      setTimeout(() => {
        fetchNotifications()
      }, 100)
    } catch (error) {
      console.error('Errore nel marcare come letto:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Marca tutti i messaggi come letti
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', currentUser)
        .eq('read', false)

      if (error) {
        if (error.code === 'PGRST200') {
          console.log('⚠️ Campo read non esiste, rimozione locale di tutte le notifiche')
          // Se il campo read non esiste, rimuovi solo localmente
          setNotifications([])
          setUnreadCount(0)
          return
        }
        console.error('Errore nel marcare tutti come letti:', error)
        return
      }

      // Aggiorna lo stato locale
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      setUnreadCount(0)
      
      // Ricarica le notifiche per assicurarsi che la persistenza sia corretta
      setTimeout(() => {
        fetchNotifications()
      }, 100)
    } catch (error) {
      console.error('Errore nel marcare tutti come letti:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  }
}
