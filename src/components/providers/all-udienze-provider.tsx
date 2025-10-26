'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { AllUdienzeView } from '@/components/calendar/all-udienze-view'

interface AllUdienzeContextType {
  openAllUdienze: (initialDate?: string) => void
  closeAllUdienze: () => void
}

const AllUdienzeContext = createContext<AllUdienzeContextType | undefined>(undefined)

export function AllUdienzeProvider({ children }: { children: ReactNode }) {
  const [showAllUdienze, setShowAllUdienze] = useState(false)
  const [initialFilterDate, setInitialFilterDate] = useState<string>('')

  const openAllUdienze = (initialDate?: string) => {
    setInitialFilterDate(initialDate || '')
    setShowAllUdienze(true)
  }

  const closeAllUdienze = () => {
    setShowAllUdienze(false)
    setInitialFilterDate('')
  }

  return (
    <AllUdienzeContext.Provider value={{ openAllUdienze, closeAllUdienze }}>
      {children}
      {showAllUdienze && (
        <AllUdienzeView 
          onClose={closeAllUdienze}
          initialDate={initialFilterDate}
        />
      )}
    </AllUdienzeContext.Provider>
  )
}

export function useAllUdienze() {
  const context = useContext(AllUdienzeContext)
  if (context === undefined) {
    throw new Error('useAllUdienze must be used within an AllUdienzeProvider')
  }
  return context
}
