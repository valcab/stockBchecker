import { useState, useEffect } from 'react'
import type { TrackedItem, CheckResult, ThemeMode } from '@/types'
import type { Language } from '@/lib/i18n'
import { getBrowserLanguage } from '@/lib/i18n'

export function useStorage() {
  const [items, setItems] = useState<TrackedItem[]>([])
  const [results, setResults] = useState<Record<string, CheckResult>>({})
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false)
  const [checkInterval, setCheckInterval] = useState(30)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [lastAutoCheckAt, setLastAutoCheckAt] = useState<string | null>(null)
  const [nextAutoCheckAt, setNextAutoCheckAt] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')

  useEffect(() => {
    loadFromStorage()

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== 'local') return

      if (changes.items) {
        setItems((changes.items.newValue as TrackedItem[]) || [])
      }
      if (changes.results) {
        setResults((changes.results.newValue as Record<string, CheckResult>) || {})
      }
      if (changes.autoCheckEnabled) {
        setAutoCheckEnabled(Boolean(changes.autoCheckEnabled.newValue))
      }
      if (changes.checkInterval) {
        setCheckInterval((changes.checkInterval.newValue as number) || 30)
      }
      if (changes.notificationsEnabled) {
        setNotificationsEnabled(changes.notificationsEnabled.newValue !== false)
      }
      if (changes.lastAutoCheckAt) {
        setLastAutoCheckAt((changes.lastAutoCheckAt.newValue as string | null) || null)
      }
      if (changes.nextAutoCheckAt) {
        setNextAutoCheckAt((changes.nextAutoCheckAt.newValue as string | null) || null)
      }
      if (changes.language) {
        setLanguage((changes.language.newValue as Language) || getBrowserLanguage())
      }
      if (changes.themeMode) {
        setThemeMode((changes.themeMode.newValue as ThemeMode) || 'system')
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const loadFromStorage = () => {
    chrome.storage.local.get(
      [
        'items',
        'results',
        'autoCheckEnabled',
        'checkInterval',
        'notificationsEnabled',
        'lastAutoCheckAt',
        'nextAutoCheckAt',
        'language',
        'themeMode',
      ],
      (result) => {
        setItems(result.items || [])
        setResults(result.results || {})
        setAutoCheckEnabled(result.autoCheckEnabled || false)
        setCheckInterval(result.checkInterval || 30)
        setNotificationsEnabled(result.notificationsEnabled !== false)
        setLastAutoCheckAt(result.lastAutoCheckAt || null)
        setNextAutoCheckAt(result.nextAutoCheckAt || null)
        setLanguage(result.language || getBrowserLanguage())
        setThemeMode(result.themeMode || 'system')
      }
    )
  }

  const saveItems = (newItems: TrackedItem[]) => {
    chrome.storage.local.set({ items: newItems }, () => {
      setItems(newItems)
    })
  }

  const saveResults = (newResults: Record<string, CheckResult>) => {
    chrome.storage.local.set({ results: newResults }, () => {
      setResults(newResults)
      updateBadge(newResults)
    })
  }

  const saveAutoCheckSettings = (
    enabled: boolean,
    interval: number,
    notifications: boolean
  ) => {
    chrome.storage.local.set(
      {
        autoCheckEnabled: enabled,
        checkInterval: interval,
        notificationsEnabled: notifications,
      },
      () => {
        setAutoCheckEnabled(enabled)
        setCheckInterval(interval)
        setNotificationsEnabled(notifications)

        chrome.runtime.sendMessage({
          type: 'UPDATE_AUTO_CHECK',
          enabled,
          interval,
        })
      }
    )
  }

  const updateBadge = (results: Record<string, CheckResult>) => {
    const availableCount = Object.values(results).filter(
      (r) => r.status === 'available'
    ).length

    if (availableCount > 0) {
      chrome.action.setBadgeText({ text: availableCount.toString() })
      chrome.action.setBadgeBackgroundColor({ color: '#9b87f5' })
    } else {
      chrome.action.setBadgeText({ text: '' })
    }
  }

  const saveLanguage = (newLanguage: Language) => {
    chrome.storage.local.set({ language: newLanguage }, () => {
      setLanguage(newLanguage)
    })
  }

  const saveThemeMode = (newThemeMode: ThemeMode) => {
    chrome.storage.local.set({ themeMode: newThemeMode }, () => {
      setThemeMode(newThemeMode)
    })
  }

  return {
    items,
    results,
    autoCheckEnabled,
    checkInterval,
    notificationsEnabled,
    lastAutoCheckAt,
    nextAutoCheckAt,
    language,
    themeMode,
    saveItems,
    saveResults,
    saveAutoCheckSettings,
    saveLanguage,
    saveThemeMode,
    refreshData: loadFromStorage,
  }
}
