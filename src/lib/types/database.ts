// Tipi per le relazioni
export type Aula = Database['public']['Tables']['aule']['Row'] & {
  tribunali: Database['public']['Tables']['tribunali']['Row']
}

export type Udienza = Database['public']['Tables']['udienze']['Row'] & {
  aule: Aula
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          bar_number: string
          specialization: string[]
          bio: string | null
          phone: string | null
          avatar_url: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          bar_number: string
          specialization: string[]
          bio?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          bar_number?: string
          specialization?: string[]
          bio?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tribunali: {
        Row: {
          id: string
          name: string
          city: string
          address: string
          type: 'penale' | 'civile' | 'amministrativo'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          address: string
          type: 'penale' | 'civile' | 'amministrativo'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          address?: string
          type?: 'penale' | 'civile' | 'amministrativo'
          created_at?: string
        }
      }
      aule: {
        Row: {
          id: string
          tribunale_id: string
          name: string
          capacity: number
          created_at: string
        }
        Insert: {
          id?: string
          tribunale_id: string
          name: string
          capacity: number
          created_at?: string
        }
        Update: {
          id?: string
          tribunale_id?: string
          name?: string
          capacity?: number
          created_at?: string
        }
      }
      udienze: {
        Row: {
          id: string
          user_id: string
          aula_id: string
          title: string
          description: string | null
          date: string
          time: string
          duration: number
          status: 'scheduled' | 'completed' | 'cancelled'
          autore: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          aula_id: string
          title: string
          description?: string | null
          date: string
          time: string
          duration: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          autore?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          aula_id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          duration?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          autore?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      presenze: {
        Row: {
          id: string
          user_id: string
          aula_id: string
          date: string
          time_in: string
          time_out: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          aula_id: string
          date: string
          time_in: string
          time_out?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          aula_id?: string
          date?: string
          time_in?: string
          time_out?: string | null
          created_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          aula_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          aula_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          aula_id?: string
          name?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_room_id: string | null
          sender_id: string
          receiver_id: string | null
          content: string
          message_type: 'room' | 'private'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id?: string | null
          sender_id: string
          receiver_id?: string | null
          content: string
          message_type: 'room' | 'private'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string | null
          sender_id?: string
          receiver_id?: string | null
          content?: string
          message_type?: 'room' | 'private'
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}