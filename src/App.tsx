import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PackageCheck, Trash2, RefreshCw, Plus, Info } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    saveItems,
    saveResults,
    saveAutoCheckSettings,
    saveLanguage,
  } = useStorage()

  const [input, setInput] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [inputError, setInputError] = useState<string>('')
  
  const t = useMemo(() => getTranslations(language), [language])

  const notifyBStockDetected = (displayName: string) => {
    if (!notificationsEnabled) return
    chrome.runtime.sendMessage({
      type: 'STOCKB_NOTIFY_AVAILABLE',
      displayName,
    })
  }

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
            newResults[item.id] = {
              ...result,
              priceChanged: !!(result.price && previousPrice && result.price !== previousPrice),
              bStockPriceChanged: !!(
                result.bStockPrice &&
                previousBStockPrice &&
                result.bStockPrice !== previousBStockPrice
              ),
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

    newResults[articleId] = {
      ...result,
      priceChanged: false,
      bStockPriceChanged: false,
    }
    saveResults(newResults)

    if (result.status === 'available') {
      notifyBStockDetected(name || `${t.article} #${articleId}`)
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
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
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

      newResults[item.id] = {
        ...result,
        priceChanged: !!(result.price && previousPrice && result.price !== previousPrice),
        bStockPriceChanged: !!(
          result.bStockPrice &&
          previousBStockPrice &&
          result.bStockPrice !== previousBStockPrice
        ),
      }

      saveResults(newResults)

      if (
        result.status === 'available' &&
        results[item.id]?.status !== 'available'
      ) {
        notifyBStockDetected(name || item.name || `${t.article} #${item.id}`)
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

  const sortedResults = Object.entries(results).sort((a, b) => {
    if (a[1].status === 'available' && b[1].status !== 'available') return -1
    if (a[1].status !== 'available' && b[1].status === 'available') return 1
    return new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime()
  })

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
        <Tabs defaultValue="results" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">
              <div className="flex items-center gap-1.5">
                <span>{t.tabResults}</span>
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-medium text-white bg-slate-400 dark:bg-slate-600 rounded-full">
                  {sortedResults.length}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="settings">{t.tabSettings}</TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 overflow-y-auto mt-3 space-y-2">
            {sortedResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {t.noResults}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all-results"
                      checked={selectedItems.size === sortedResults.length && sortedResults.length > 0}
                      onCheckedChange={handleToggleAll}
                    />
                    <Label htmlFor="select-all-results" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                      {selectedItems.size === sortedResults.length && sortedResults.length > 0 ? t.deselectAll || 'Deselect All' : t.selectAll || 'Select All'}
                      {selectedItems.size > 0 && (
                        <span className="inline-flex items-center justify-center min-w-3 h-3 px-0.5 text-[8px] font-bold text-white bg-purple-600 rounded-full">
                          {selectedItems.size}
                        </span>
                      )}
                    </Label>
                  </div>
                  <AnimatePresence>
                    {selectedItems.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={handleClearSelected}
                        >
                          {t.clearAllButton}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {sortedResults.map(([articleId, data]) => {
                const item = items.find((i) => i.id === articleId)
                const displayName = item?.name || `${t.article} #${articleId}`
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
                          ? 'border-green-500 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900'
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
                          <p className="text-sm font-medium truncate">
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
                                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
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
                                        ? 'bg-green-600 dark:bg-green-600 text-white'
                                        : 'bg-green-500 dark:bg-green-500 text-white'
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
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveItemById(articleId)
                          }}
                          className={`ml-2 h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                            data.status === 'available' 
                              ? 'hover:bg-green-200 dark:hover:bg-green-800' 
                              : ''
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
                })}
              </>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto mt-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.settingsTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Bottom Button */}
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
    </div>
  )
}

export default App
