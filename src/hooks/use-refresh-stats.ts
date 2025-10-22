import { useState, useCallback } from 'react'

export function useRefreshStats() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshStats = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return { refreshTrigger, refreshStats }
}
