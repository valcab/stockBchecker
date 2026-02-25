import { useState, useEffect } from 'react'
import type { TrackedItem, CheckResult } from '@/types'
import type { Language } from '@/lib/i18n'
import { getBrowserLanguage } from '@/lib/i18n'

export function useStorage() {
  const [items, setItems] = useState<TrackedItem[]>([])
  const [results, setResults] = useState<Record<string, CheckResult>>({})
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false)
  const [checkInterval, setCheckInterval] = useState(30)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    loadFromStorage()
  }, [])

  const loadFromStorage = () => {
    chrome.storage.local.get(
      ['items', 'results', 'autoCheckEnabled', 'checkInterval', 'notificationsEnabled', 'language'],
      (result) => {
        setItems(result.items || [])
        setResults(result.results || {})
        setAutoCheckEnabled(result.autoCheckEnabled || false)
        setCheckInterval(result.checkInterval || 30)
        setNotificationsEnabled(result.notificationsEnabled !== false)
        setLanguage(result.language || getBrowserLanguage())
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

  return {
    items,
    results,
    autoCheckEnabled,
    checkInterval,
    notificationsEnabled,
    language,
    saveItems,
    saveResults,
    saveAutoCheckSettings,
    saveLanguage,
    refreshData: loadFromStorage,
  }
}
