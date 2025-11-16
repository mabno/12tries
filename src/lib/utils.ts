import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayUTCString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export function getTodayUTC(): Date {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const day = now.getUTCDate()
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

export function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.9) return 'text-green-600'
  if (similarity >= 0.7) return 'text-lime-600'
  if (similarity >= 0.5) return 'text-yellow-600'
  if (similarity >= 0.3) return 'text-orange-600'
  return 'text-red-600'
}

export function getSimilarityLabel(similarity: number, t: (key: string) => string): string {
  if (similarity >= 0.9) return t('similarity.excellent')
  if (similarity >= 0.7) return t('similarity.veryClose')
  if (similarity >= 0.5) return t('similarity.gettingWarmer')
  if (similarity >= 0.3) return t('similarity.cold')
  return t('similarity.freezing')
}
