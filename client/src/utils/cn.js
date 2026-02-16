import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind inteligentemente,
 * resolviendo conflictos (ej: p-4 + p-6 → p-6)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
