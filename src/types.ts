import type { Language } from './lib/i18n'

export type ThemeMode = 'system' | 'light' | 'dark'

export interface TrackedItem {
  id: string
  url: string
  name: string | null
  addedAt: string
}

export interface CheckResult {
  status: 'checking' | 'available' | 'unavailable' | 'error'
  message?: string
  timestamp: string
  price?: string
  priceChanged?: boolean
  bStockPrice?: string
  bStockUrl?: string
  bStockPriceChanged?: boolean
  imageUrl?: string
}

export interface StorageData {
  items: TrackedItem[]
  results: Record<string, CheckResult>
  autoCheckEnabled: boolean
  checkInterval: number
  notificationsEnabled: boolean
  lastAutoCheckAt?: string | null
  nextAutoCheckAt?: string | null
  language: Language
  themeMode?: ThemeMode
}
