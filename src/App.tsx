import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PackageCheck,
  Trash2,
  RefreshCw,
  Plus,
  Info,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Sparkles,
  ArrowDownToLine,
  ArrowUpToLine,
  Sun,
  Moon,
  Monitor,
  SearchX,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useStorage } from '@/hooks/useStorage'
import { extractArticleId, checkStockB } from '@/lib/checker'
import { getTranslations } from '@/lib/i18n'
import type { TrackedItem } from '@/types'

function App() {
  const {
    items,
    results,
    autoCheckEnabled,
    checkInterval,
    notificationsEnabled,
    language,
    themeMode,
    saveItems,
    saveResults,
    saveAutoCheckSettings,
    saveLanguage,
    saveThemeMode,
  } = useStorage()

  const [input, setInput] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [inputError, setInputError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('results')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBStock, setFilterBStock] = useState('all')
  const [filterSort, setFilterSort] = useState('default')
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
  const [settingsNotice, setSettingsNotice] = useState<string>('')
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  
  const t = useMemo(() => getTranslations(language), [language])
  const resolvedTheme = themeMode === 'system'
    ? (systemPrefersDark ? 'dark' : 'light')
    : themeMode

  const notifyBStockDetected = (itemId: string, displayName: string, force = true) => {
    if (!notificationsEnabled) return
    chrome.runtime.sendMessage({
      type: 'STOCKB_NOTIFY_AVAILABLE',
      itemId,
      displayName,
      force,
    })
  }

  useEffect(() => {
    chrome.storage.local.get(['onboardingCompleted'], (storage) => {
      if (storage.onboardingCompleted !== true) {
        setShowOnboarding(true)
        setOnboardingStep(0)
      }
    })
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const applyPreference = (matches: boolean) => {
      setSystemPrefersDark(matches)
    }

    applyPreference(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => applyPreference(event.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const isDark = resolvedTheme === 'dark'

    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [resolvedTheme])

  // Check all items on mount
  useEffect(() => {
    if (items.length > 0) {
      (async () => {
        setIsChecking(true)
        const newResults = { ...results }
        let updated = false
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const resultData = results[item.id]
          // Only check if result is missing or imageUrl is not present
          if (!resultData || !resultData.imageUrl) {
            const { result, name } = await checkStockB(item.url)
            const previousPrice = resultData?.price
            const previousBStockPrice = resultData?.bStockPrice
            const previousImageUrl = resultData?.imageUrl
            newResults[item.id] = {
              ...result,
              priceChanged: !!(result.price && previousPrice && result.price !== previousPrice),
              bStockPriceChanged: !!(
                result.bStockPrice &&
                previousBStockPrice &&
                result.bStockPrice !== previousBStockPrice
              ),
              imageUrl: result.imageUrl || previousImageUrl,
            }
            updated = true
            if (name && !item.name) {
              const updatedItems = [...items]
              updatedItems[i] = { ...item, name }
              saveItems(updatedItems)
            }
          }
        }
        if (updated) {
          saveResults(newResults)
        }
        setIsChecking(false)
      })()
    }
  }, [items])

  const handleAddItem = async () => {
    if (!input.trim()) {
      setInputError(t.alertEnterUrl)
      return
    }

    const articleId = extractArticleId(input)
    if (!articleId) {
      setInputError(t.alertInvalidUrl)
      return
    }

    const isUrl = articleId.match(/^https?:\/\//i)
    const url = isUrl ? articleId : `https://www.thomann.de/${articleId}.html`

    if (items.some((item) => item.id === articleId || item.url === url)) {
      setInputError(t.alertAlreadyTracked)
      return
    }

    setInputError('')

    const newItem: TrackedItem = {
      id: articleId,
      url,
      name: null,
      addedAt: new Date().toISOString(),
    }

    const updatedItems = [...items, newItem]
    saveItems(updatedItems)
    setInput('')

    // Automatically check the newly added item
    const newResults = { ...results }
    newResults[articleId] = {
      status: 'checking',
      timestamp: new Date().toISOString(),
    }
    saveResults(newResults)

    const { result, name } = await checkStockB(url)
    const previousImageUrl = newResults[articleId]?.imageUrl

    newResults[articleId] = {
      ...result,
      priceChanged: false,
      bStockPriceChanged: false,
      imageUrl: result.imageUrl || previousImageUrl,
    }
    saveResults(newResults)

    if (result.status === 'available') {
      notifyBStockDetected(articleId, name || `${t.article} #${articleId}`)
    }

    // Update item name if found
    if (name) {
      const itemsWithName = updatedItems.map(item =>
        item.id === articleId ? { ...item, name } : item
      )
      saveItems(itemsWithName)
    }
  }

  const handleRemoveItemById = (articleId: string) => {
    const newItems = items.filter(item => item.id !== articleId)
    saveItems(newItems)
    
    // Remove from results
    const newResults = { ...results }
    delete newResults[articleId]
    saveResults(newResults)
    
    // Remove from selected items if it was selected
    if (selectedItems.has(articleId)) {
      const newSelected = new Set(selectedItems)
      newSelected.delete(articleId)
      setSelectedItems(newSelected)
    }
  }

  const handleClearSelected = () => {
    if (!confirm(t.alertClearConfirm)) return
    
    // Filter out selected items
    const newItems = items.filter(item => !selectedItems.has(item.id))
    saveItems(newItems)
    
    // Clear results for removed items
    const newResults = { ...results }
    selectedItems.forEach(itemId => {
      delete newResults[itemId]
    })
    saveResults(newResults)
    
    // Clear selection
    setSelectedItems(new Set())
  }

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleToggleAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
      return
    }

    setSelectedItems(new Set(items.map(item => item.id)))
  }

  const handleCheckAll = async () => {
    if (items.length === 0) {
      alert(t.alertNoItems)
      return
    }

    setIsChecking(true)

    const newResults = { ...results }
    items.forEach((item) => {
      newResults[item.id] = {
        status: 'checking',
        timestamp: new Date().toISOString(),
      }
    })
    saveResults(newResults)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const { result, name } = await checkStockB(item.url)

      const previousPrice = results[item.id]?.price
      const previousBStockPrice = results[item.id]?.bStockPrice
      const previousImageUrl = results[item.id]?.imageUrl

      newResults[item.id] = {
        ...result,
        priceChanged: !!(result.price && previousPrice && result.price !== previousPrice),
        bStockPriceChanged: !!(
          result.bStockPrice &&
          previousBStockPrice &&
          result.bStockPrice !== previousBStockPrice
        ),
        imageUrl: result.imageUrl || previousImageUrl,
      }

      saveResults(newResults)

      if (
        result.status === 'available' &&
        results[item.id]?.status !== 'available'
      ) {
        notifyBStockDetected(item.id, name || item.name || `${t.article} #${item.id}`)
      }

      if (name && !item.name) {
        const updatedItems = [...items]
        updatedItems[i] = { ...item, name }
        saveItems(updatedItems)
      }
    }

    setIsChecking(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  const getBStockLink = (url?: string) => {
    if (!url) return null
    if (/_b_stock\.htm(?:$|[?#])/i.test(url)) return url

    try {
      const parsed = new URL(url)
      parsed.pathname = parsed.pathname.replace(/\.htm$/i, '_b_stock.htm')
      return parsed.toString()
    } catch {
      return url.replace(/\.htm$/i, '_b_stock.htm')
    }
  }

  const finishOnboarding = () => {
    setShowOnboarding(false)
    setOnboardingStep(0)
    chrome.storage.local.set({ onboardingCompleted: true })
  }

  const launchOnboarding = () => {
    setActiveTab('settings')
    setShowOnboarding(true)
    setOnboardingStep(0)
  }

  const clearFilters = () => {
    setFilterQuery('')
    setFilterStatus('all')
    setFilterBStock('all')
    setFilterSort('default')
  }

  const parsePriceValue = (value?: string) => {
    if (!value) return Number.POSITIVE_INFINITY
    const parsed = Number.parseFloat(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
  }

  const compareResults = (
    [leftId, leftData]: [string, (typeof results)[string]],
    [rightId, rightData]: [string, (typeof results)[string]]
  ) => {
    const leftItem = items.find((item) => item.id === leftId)
    const rightItem = items.find((item) => item.id === rightId)

    switch (filterSort) {
      case 'checked-desc':
        return new Date(rightData.timestamp).getTime() - new Date(leftData.timestamp).getTime()
      case 'checked-asc':
        return new Date(leftData.timestamp).getTime() - new Date(rightData.timestamp).getTime()
      case 'name-asc':
        return (leftItem?.name || leftId).localeCompare(rightItem?.name || rightId)
      case 'name-desc':
        return (rightItem?.name || rightId).localeCompare(leftItem?.name || leftId)
      case 'price-asc':
        return parsePriceValue(leftData.bStockPrice || leftData.price) - parsePriceValue(rightData.bStockPrice || rightData.price)
      case 'price-desc':
        return parsePriceValue(rightData.bStockPrice || rightData.price) - parsePriceValue(leftData.bStockPrice || leftData.price)
      default:
        if (leftData.status === 'available' && rightData.status !== 'available') return -1
        if (leftData.status !== 'available' && rightData.status === 'available') return 1
        return new Date(rightData.timestamp).getTime() - new Date(leftData.timestamp).getTime()
    }
  }

  const allResults = Object.entries(results)

  const filteredResults = allResults
    .filter(([articleId, data]) => {
    const item = items.find((i) => i.id === articleId)
    const query = filterQuery.trim().toLowerCase()

    if (filterStatus !== 'all' && data.status !== filterStatus) {
      return false
    }

    if (filterBStock === 'available' && data.status !== 'available') {
      return false
    }

    if (filterBStock === 'missing' && data.status === 'available') {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [articleId, item?.name, item?.url]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
    .sort(compareResults)

  const exportTrackedItems = () => {
    if (items.length === 0) {
      setSettingsNotice(t.exportEmpty || 'No tracked items to export.')
      return
    }

    const payload = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        items,
      },
      null,
      2
    )

    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `b-stock-beacon-items-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setSettingsNotice('')
  }

  const importTrackedItems = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw)
      const importedItems = Array.isArray(parsed) ? parsed : parsed?.items

      if (!Array.isArray(importedItems)) {
        throw new Error('invalid')
      }

      const mergedItems = [...items]
      for (const importedItem of importedItems) {
        if (!importedItem?.id || !importedItem?.url) {
          continue
        }

        const alreadyTracked = mergedItems.some(
          (item) => item.id === importedItem.id || item.url === importedItem.url
        )

        if (alreadyTracked) {
          continue
        }

        mergedItems.push({
          id: importedItem.id,
          url: importedItem.url,
          name: importedItem.name || null,
          addedAt: importedItem.addedAt || new Date().toISOString(),
        })
      }

      saveItems(mergedItems)
      setSettingsNotice(t.importSuccess || 'Tracked items imported.')
    } catch {
      setSettingsNotice(t.importInvalid || 'Invalid import file.')
    } finally {
      event.target.value = ''
    }
  }

  const hasActiveFilters =
    filterQuery.trim().length > 0 ||
    filterStatus !== 'all' ||
    filterBStock !== 'all'
  const hasActiveSort = filterSort !== 'default'

  const renderEmptyState = ({
    icon,
    title,
    description,
    action,
    secondaryAction,
  }: {
    icon: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
    secondaryAction?: React.ReactNode
  }) => (
    <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-10 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(var(--border) / 0.55) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.55) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(circle at center, black, transparent 78%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative mx-auto flex max-w-[260px] flex-col items-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border bg-background/95 shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {secondaryAction}
            {action}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-[400px] h-[600px] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{t.aboutTitle || 'About This Extension'}</h3>
              <p className="text-sm text-muted-foreground">
                {t.aboutDescription || 'This extension helps you track Stock B availability on Thomann products. Get notified when your favorite gear becomes available at a great price!'}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium">{t.madeBy || 'Made by'}</p>
                <div className="flex flex-col gap-1">
                  <a
                    href="https://linkedin.com/in/your-profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    💼 {t.linkedin || 'LinkedIn'}
                  </a>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Add Item Section */}
      <div className="px-4 pt-4">


              <div className="flex gap-2">
                <div className="flex w-full max-w-md items-center space-x-2">
                  <div className="flex flex-1 items-stretch rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
                    <Input
                      placeholder={t.inputPlaceholder}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value)
                        setInputError('')
                      }}
                      onKeyPress={handleKeyPress}
                      className={`flex-1 border-none focus-visible:ring-0 bg-transparent ${inputError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <TooltipProvider delayDuration={50}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={handleAddItem}
                            size="icon"
                            className="rounded-none rounded-r-md border-l border-border"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t.addButton}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              {inputError && (
                <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 pt-2 duration-200">
                  {inputError}
                </p>
              )}
            
      </div>

      {/* Tabs Section - Scrollable */}
      <div className="flex-1 overflow-hidden px-4 pt-3">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">
              <div className="flex items-center gap-1.5">
                <span>{t.tabResults}</span>
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-medium text-white bg-slate-400 dark:bg-slate-600 rounded-full">
                  {allResults.length}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="settings">{t.tabSettings}</TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-3 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 pb-4 pr-3">
                {allResults.length === 0 ? (
                  renderEmptyState({
                    icon: <FolderOpen className="h-7 w-7 text-primary" />,
                    title: t.noResultsTitle || t.noResults,
                    description: t.noResultsDescription || t.noResults,
                    action: (
                      <Button size="sm" onClick={launchOnboarding}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t.noResultsAction || t.onboardingButton}
                      </Button>
                    ),
                  })
                ) : (
                  <>
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 overflow-visible rounded-md border bg-background/95 p-2 backdrop-blur">
                      <div className="flex min-w-0 flex-1 items-center space-x-2">
                        <Checkbox
                          id="select-all-results"
                          checked={selectedItems.size === allResults.length && allResults.length > 0}
                          onCheckedChange={handleToggleAll}
                        />
                        <Label htmlFor="select-all-results" className="flex min-w-0 cursor-pointer items-center gap-1.5 text-sm font-medium">
                          <span className="truncate">
                          {selectedItems.size === allResults.length && allResults.length > 0 ? t.deselectAll || 'Deselect All' : t.selectAll || 'Select All'}
                          </span>
                          {selectedItems.size > 0 && (
                            <span className="inline-flex items-center justify-center min-w-3 h-3 px-0.5 text-[8px] font-bold text-white bg-blue-600 rounded-full">
                              {selectedItems.size}
                            </span>
                          )}
                        </Label>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <AnimatePresence>
                          {selectedItems.size > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: 20, scale: 0.8 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: 20, scale: 0.8 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <TooltipProvider delayDuration={50}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={handleClearSelected}
                                      aria-label={t.clearAllButton}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t.clearAllButton}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                          <TooltipProvider delayDuration={50}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative h-8 w-8"
                                    aria-label={t.filtersSort || 'Sort'}
                                  >
                                    <ArrowUpDown className="h-4 w-4" />
                                    {hasActiveSort && (
                                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                                    )}
                                  </Button>
                                </PopoverTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.filtersSort || 'Sort'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <PopoverContent className="w-72" align="end">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <h3 className="text-sm font-semibold">{t.filtersSort || 'Sort'}</h3>
                              </div>

                              <div className="space-y-2">
                                <Select value={filterSort} onValueChange={setFilterSort}>
                                  <SelectTrigger id="filters-sort">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">{t.filtersSortDefault || 'Available first'}</SelectItem>
                                    <SelectItem value="checked-desc">{t.filtersSortNewest || 'Last checked: newest'}</SelectItem>
                                    <SelectItem value="checked-asc">{t.filtersSortOldest || 'Last checked: oldest'}</SelectItem>
                                    <SelectItem value="name-asc">{t.filtersSortNameAsc || 'Name: A to Z'}</SelectItem>
                                    <SelectItem value="name-desc">{t.filtersSortNameDesc || 'Name: Z to A'}</SelectItem>
                                    <SelectItem value="price-asc">{t.filtersSortPriceAsc || 'Price: low to high'}</SelectItem>
                                    <SelectItem value="price-desc">{t.filtersSortPriceDesc || 'Price: high to low'}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <TooltipProvider delayDuration={50}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative h-8 w-8"
                                    aria-label={t.filtersButton || 'Filters'}
                                  >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                                    )}
                                  </Button>
                                </PopoverTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.filtersButton || 'Filters'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <PopoverContent className="w-72 max-h-[320px] overflow-y-auto" align="end">
                            <div className="space-y-4 pr-1">
                              <div className="space-y-1">
                                <h3 className="text-sm font-semibold">{t.filtersButton || 'Filters'}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {t.filtersDescription || 'Filter by text, status, or B-Stock availability.'}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="filters-query" className="text-sm">
                                  {t.filtersSearch || 'Search'}
                                </Label>
                                <Input
                                  id="filters-query"
                                  value={filterQuery}
                                  onChange={(e) => setFilterQuery(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setIsFilterPopoverOpen(false)
                                    }
                                  }}
                                  placeholder={t.filtersSearchPlaceholder || 'Name, URL or article ID'}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="filters-status" className="text-sm">
                                  {t.filtersStatus || 'Status'}
                                </Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                  <SelectTrigger id="filters-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">{t.filtersAll || 'All'}</SelectItem>
                                    <SelectItem value="available">{t.filtersAvailable || 'Available'}</SelectItem>
                                    <SelectItem value="unavailable">{t.filtersUnavailable || 'Unavailable'}</SelectItem>
                                    <SelectItem value="checking">{t.filtersChecking || 'Checking'}</SelectItem>
                                    <SelectItem value="error">{t.filtersError || 'Error'}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="filters-bstock" className="text-sm">
                                  {t.filtersBStock || 'B-Stock'}
                                </Label>
                                <Select value={filterBStock} onValueChange={setFilterBStock}>
                                  <SelectTrigger id="filters-bstock">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">{t.filtersAll || 'All'}</SelectItem>
                                    <SelectItem value="available">{t.filtersBStockAvailable || 'Available only'}</SelectItem>
                                    <SelectItem value="missing">{t.filtersBStockMissing || 'Not available'}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {filteredResults.length} / {allResults.length}
                                </p>
                                <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                                  {t.filtersReset || 'Reset'}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {filteredResults.length === 0 ? (
                      renderEmptyState({
                        icon: <SearchX className="h-7 w-7 text-primary" />,
                        title: t.filtersEmptyTitle || t.filtersEmpty || 'No items match the current filters.',
                        description:
                          t.filtersEmptyDescription ||
                          t.filtersEmpty ||
                          'No items match the current filters.',
                        secondaryAction: (
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            {t.filtersReset || 'Reset'}
                          </Button>
                        ),
                      })
                    ) : filteredResults.map(([articleId, data]) => {
                const item = items.find((i) => i.id === articleId)
                const displayName = item?.name || item?.url || `${t.article} #${articleId}`
                const date = new Date(data.timestamp).toLocaleTimeString()

                return (
                  <motion.div
                    key={articleId}
                    className="group"
                    initial={false}
                  >
                    <div
                      className={`p-3 rounded-md border transition-colors ${
                        data.status === 'available'
                          ? 'border-green-500 bg-green-50 hover:bg-green-100 dark:border-emerald-500/70 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/50'
                          : data.status === 'error'
                          ? 'border-destructive bg-destructive/10 hover:bg-destructive/20'
                          : 'border-muted bg-card hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`result-${articleId}`}
                            checked={selectedItems.has(articleId)}
                            onCheckedChange={() => handleToggleItem(articleId)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          />
                        </div>
                        {data.imageUrl && (
                          <a
                            href={item?.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={data.imageUrl}
                              alt={displayName}
                              className="w-16 h-16 object-cover rounded flex-shrink-0 hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </a>
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={item?.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                          <p className="text-sm font-medium break-all leading-5">
                            {displayName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                data.status === 'available'
                                  ? 'bg-green-500'
                                  : data.status === 'error'
                                  ? 'bg-destructive'
                                  : data.status === 'checking'
                                  ? 'bg-yellow-500 animate-pulse'
                                  : 'bg-muted-foreground'
                              }`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {data.status === 'checking' 
                                ? t.checking 
                                : data.status === 'available' 
                                ? t.available 
                                : data.status === 'unavailable'
                                ? t.unavailable
                                : data.message || t.checking}
                            </span>
                          </div>
                          {(data.price || (data.status === 'available' && data.bStockPrice)) && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {data.price && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    data.priceChanged
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                      : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {data.price}€
                                </span>
                              )}
                              {data.status === 'available' && data.bStockPrice && (
                                <>
                                  <span className="text-slate-400 dark:text-slate-500">→</span>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      data.bStockPriceChanged
                                        ? 'bg-green-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                                        : 'bg-green-500 text-white dark:bg-emerald-400 dark:text-slate-950'
                                    }`}
                                  >
                                    {data.bStockPrice}€
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.checkedAt} {date}
                          </p>
                          </a>
                          {data.status === 'available' && (
                            <a
                              href={data.bStockUrl || getBStockLink(item?.url) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{t.bStockLink}</span>
                              <ExternalLink className="ml-1 h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <Popover
                          open={confirmDeleteId === articleId}
                          onOpenChange={(open) => setConfirmDeleteId(open ? articleId : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmDeleteId(articleId)
                              }}
                              className={`ml-2 h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                                data.status === 'available' 
                                  ? 'hover:bg-green-200 dark:hover:bg-green-800' 
                                  : ''
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-3">
                              <p className="text-sm font-medium">
                                {t.deleteConfirmTitle || 'Remove this item?'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t.deleteConfirmDescription || 'This will remove the item from tracking and results.'}
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setConfirmDeleteId(null)
                                  }}
                                >
                                  {t.cancelButton || 'Cancel'}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItemById(articleId)
                                    setConfirmDeleteId(null)
                                  }}
                                >
                                  {t.confirmDeleteButton || 'Delete'}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </motion.div>
                )
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-3 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="pb-4 pr-3">
              <Card>
                <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm">{t.themeLabel || 'Theme'}</Label>
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          value: 'system',
                          label: t.themeSystemLabel || 'Follow device theme',
                          shortLabel: 'System',
                          icon: <Monitor className="h-4 w-4" />,
                        },
                        {
                          value: 'light',
                          label: t.themeLight || 'Light',
                          shortLabel: t.themeLight || 'Light',
                          icon: <Sun className="h-4 w-4" />,
                        },
                        {
                          value: 'dark',
                          label: t.themeDark || 'Dark',
                          shortLabel: t.themeDark || 'Dark',
                          icon: <Moon className="h-4 w-4" />,
                        },
                      ].map((option) => {
                        const isActive = themeMode === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => saveThemeMode(option.value as 'system' | 'light' | 'dark')}
                            aria-pressed={isActive}
                            aria-label={option.label}
                            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                              isActive
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {option.icon}
                            <span className="truncate">{option.shortLabel}</span>
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {themeMode === 'system'
                        ? `${t.themeSystemLabel || 'Follow device theme'}: ${resolvedTheme === 'dark' ? t.themeDark || 'Dark' : t.themeLight || 'Light'}`
                        : resolvedTheme === 'dark'
                        ? t.themeDark || 'Dark'
                        : t.themeLight || 'Light'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-check"
                    checked={autoCheckEnabled}
                    onCheckedChange={(checked) =>
                      saveAutoCheckSettings(
                        checked as boolean,
                        checkInterval,
                        notificationsEnabled
                      )
                    }
                  />
                  <Label htmlFor="auto-check" className="text-sm cursor-pointer">
                    {t.autoCheckLabel}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-sm">
                    {t.checkIntervalLabel}
                  </Label>
                  <Select
                    value={checkInterval.toString()}
                    onValueChange={(value) =>
                      saveAutoCheckSettings(
                        autoCheckEnabled,
                        parseInt(value),
                        notificationsEnabled
                      )
                    }
                  >
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t.interval1min}</SelectItem>
                      <SelectItem value="5">{t.interval5min}</SelectItem>
                      <SelectItem value="15">{t.interval15min}</SelectItem>
                      <SelectItem value="30">{t.interval30min}</SelectItem>
                      <SelectItem value="60">{t.interval1hour}</SelectItem>
                      <SelectItem value="120">{t.interval2hours}</SelectItem>
                      <SelectItem value="360">{t.interval6hours}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={(checked) =>
                      saveAutoCheckSettings(
                        autoCheckEnabled,
                        checkInterval,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor="notifications" className="text-sm cursor-pointer">
                    {t.notificationsLabel}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm">
                    {t.languageLabel}
                  </Label>
                  <Select
                    value={language}
                    onValueChange={(value) => saveLanguage(value as any)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Guide</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={launchOnboarding}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t.onboardingButton}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{t.importExportTitle || 'Backup'}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0 justify-center"
                      onClick={() => importInputRef.current?.click()}
                    >
                      <ArrowUpToLine className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{t.importButton || 'Import'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0 justify-center"
                      onClick={exportTrackedItems}
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{t.exportButton || 'Export'}</span>
                    </Button>
                  </div>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={importTrackedItems}
                  />
                  {settingsNotice && (
                    <p className="text-xs text-muted-foreground">{settingsNotice}</p>
                  )}
                </div>
                </CardContent>
              </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Bottom Button */}
      {activeTab === 'results' && (
        <div className="border-t bg-background p-4">
          <Button
            onClick={handleCheckAll}
            disabled={isChecking || items.length === 0}
            className="w-full"
            size="lg"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t.checking}
              </>
            ) : (
              t.checkAllButton
            )}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="w-full rounded-2xl border bg-background p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    {t.onboardingTitle}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    {onboardingStep === 0 ? t.onboardingStep1Title : t.onboardingStep2Title}
                  </h2>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {onboardingStep + 1}/2
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-sky-100 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      {onboardingStep === 0 ? <Plus className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                    </div>
                    <p className="text-sm font-semibold">
                      {onboardingStep === 0 ? t.onboardingStep1Title : t.onboardingStep2Title}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-slate-700">
                    {onboardingStep === 0 ? t.onboardingStep1Description : t.onboardingStep2Description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={finishOnboarding}>
                    {t.onboardingSkip}
                  </Button>
                  {onboardingStep === 0 ? (
                    <Button size="sm" onClick={() => setOnboardingStep(1)}>
                      {t.onboardingNext}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={finishOnboarding}>
                      {t.onboardingDone}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
