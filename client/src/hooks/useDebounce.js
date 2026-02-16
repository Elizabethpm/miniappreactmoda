import { useState, useEffect } from 'react'

/**
 * Retrasa la actualización de un valor hasta que el usuario
 * deja de escribir (útil para búsquedas en tiempo real).
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
