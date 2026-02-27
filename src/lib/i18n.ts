export type Language = 'en' | 'fr' | 'de'

export const translations = {
  en: {
    // Header
    title: 'B-Stock Beacon',
    
    // Add item
    inputPlaceholder: 'Enter URL or ID',
    addButton: 'Add',
    
    // Tabs
    tabResults: 'Results',
    tabItems: 'Items',
    tabSettings: 'Settings',
    
    // Results
    noResults: 'No results yet. Add items and check them!',
    available: 'Stock B is available',
    unavailable: 'Stock B is not available',
    checking: 'Checking...',
    checkedAt: 'Checked at',
    
    // Items
    noItems: 'No items tracked yet',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selected: 'selected',
    
    // Settings
    settingsTitle: 'Auto-Check Settings',
    autoCheckLabel: 'Enable automatic checks',
    checkIntervalLabel: 'Check every:',
    notificationsLabel: 'Show notifications when B-Stock found',
    clearAllButton: 'Clear All',
    removeButton: 'Remove',
    cancelButton: 'Cancel',
    confirmDeleteButton: 'Delete',
    deleteConfirmTitle: 'Remove this item?',
    deleteConfirmDescription: 'This will remove the item from tracking and results.',
    languageLabel: 'Language',
    
    // Check button
    checkAllButton: 'Check All Items',
    
    // Intervals
    interval1min: '1 minute',
    interval5min: '5 minutes',
    interval15min: '15 minutes',
    interval30min: '30 minutes',
    interval1hour: '1 hour',
    interval2hours: '2 hours',
    interval6hours: '6 hours',
    
    // Alerts
    alertEnterUrl: 'Please enter a URL or article ID',
    alertInvalidUrl: 'Invalid URL or article ID',
    alertAlreadyTracked: 'This item is already tracked',
    alertNoItems: 'No items to check',
    alertClearConfirm: 'Are you sure you want to clear all items?',
    
    // Other
    article: 'Article',
    
    // About
    aboutTitle: 'About This Extension',
    aboutDescription: 'This extension helps you track Stock B availability on Thomann products. Get notified when your favorite gear becomes available at a great price!',
    madeBy: 'Made by',
    website: 'Website',
    linkedin: 'LinkedIn',
  },
  fr: {
    // Header
    title: 'B-Stock Beacon',
    
    // Add item
    inputPlaceholder: 'Entrez URL ou ID',
    addButton: 'Ajouter',
    
    // Tabs
    tabResults: 'Résultats',
    tabItems: 'Articles',
    tabSettings: 'Paramètres',
    
    // Results
    noResults: 'Aucun résultat pour le moment. Ajoutez des articles et vérifiez-les !',
    available: 'Stock B disponible',
    unavailable: 'Stock B non disponible',
    checking: 'Vérification...',
    checkedAt: 'Vérifié à',
    
    // Items
    noItems: 'Aucun article suivi',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    selected: 'sélectionné(s)',
    
    // Settings
    settingsTitle: 'Paramètres de vérification automatique',
    autoCheckLabel: 'Activer les vérifications automatiques',
    checkIntervalLabel: 'Vérifier toutes les :',
    notificationsLabel: 'Afficher les notifications quand le Stock B est trouvé',
    clearAllButton: 'Tout effacer',
    removeButton: 'Supprimer',
    cancelButton: 'Annuler',
    confirmDeleteButton: 'Supprimer',
    deleteConfirmTitle: 'Supprimer cet article ?',
    deleteConfirmDescription: 'Cela supprimera le suivi et le resultat associe.',
    languageLabel: 'Langue',
    
    // Check button
    checkAllButton: 'Vérifier tous les articles',
    
    // Intervals
    interval1min: '1 minute',
    interval5min: '5 minutes',
    interval15min: '15 minutes',
    interval30min: '30 minutes',
    interval1hour: '1 heure',
    interval2hours: '2 heures',
    interval6hours: '6 heures',
    
    // Alerts
    alertEnterUrl: 'Veuillez entrer une URL ou un ID d\'article',
    alertInvalidUrl: 'URL ou ID d\'article invalide',
    alertAlreadyTracked: 'Cet article est déjà suivi',
    alertNoItems: 'Aucun article à vérifier',
    alertClearConfirm: 'Êtes-vous sûr de vouloir tout effacer ?',
    
    // Other
    article: 'Article',
    
    // About
    aboutTitle: 'À propos de cette extension',
    aboutDescription: 'Cette extension vous aide à suivre la disponibilité du Stock B sur les produits Thomann. Soyez notifié quand votre matériel préféré devient disponible à un excellent prix !',
    madeBy: 'Créé par',
    website: 'Site web',
    linkedin: 'LinkedIn',
  },
  de: {
    // Header
    title: 'B-Stock Beacon',
    
    // Add item
    inputPlaceholder: 'URL oder ID eingeben',
    addButton: 'Hinzufügen',
    
    // Tabs
    tabResults: 'Ergebnisse',
    tabItems: 'Artikel',
    tabSettings: 'Einstellungen',
    
    // Results
    noResults: 'Noch keine Ergebnisse. Fügen Sie Artikel hinzu und prüfen Sie sie!',
    available: 'B-Ware verfügbar',
    unavailable: 'B-Ware nicht verfügbar',
    checking: 'Wird geprüft...',
    checkedAt: 'Geprüft um',
    
    // Items
    noItems: 'Noch keine Artikel verfolgt',
    selectAll: 'Alle auswählen',
    deselectAll: 'Alle abwählen',
    selected: 'ausgewählt',
    
    // Settings
    settingsTitle: 'Einstellungen für automatische Prüfung',
    autoCheckLabel: 'Automatische Prüfungen aktivieren',
    checkIntervalLabel: 'Prüfen alle:',
    notificationsLabel: 'Benachrichtigungen anzeigen, wenn B-Ware gefunden wird',
    clearAllButton: 'Alles löschen',
    removeButton: 'Entfernen',
    cancelButton: 'Abbrechen',
    confirmDeleteButton: 'Loschen',
    deleteConfirmTitle: 'Diesen Artikel entfernen?',
    deleteConfirmDescription: 'Dadurch werden Tracking und Ergebnis entfernt.',
    languageLabel: 'Sprache',
    
    // Check button
    checkAllButton: 'Alle Artikel prüfen',
    
    // Intervals
    interval1min: '1 Minute',
    interval5min: '5 Minuten',
    interval15min: '15 Minuten',
    interval30min: '30 Minuten',
    interval1hour: '1 Stunde',
    interval2hours: '2 Stunden',
    interval6hours: '6 Stunden',
    
    // Alerts
    alertEnterUrl: 'Bitte geben Sie eine URL oder Artikel-ID ein',
    alertInvalidUrl: 'Ungültige URL oder Artikel-ID',
    alertAlreadyTracked: 'Dieser Artikel wird bereits verfolgt',
    alertNoItems: 'Keine Artikel zum Prüfen',
    alertClearConfirm: 'Sind Sie sicher, dass Sie alles löschen möchten?',
    
    // Other
    article: 'Artikel',
    
    // About
    aboutTitle: 'Über diese Erweiterung',
    aboutDescription: 'Diese Erweiterung hilft Ihnen, die Verfügbarkeit von B-Ware bei Thomann-Produkten zu verfolgen. Lassen Sie sich benachrichtigen, wenn Ihre Lieblingsausrüstung zu einem tollen Preis verfügbar wird!',
    madeBy: 'Erstellt von',
    website: 'Webseite',
    linkedin: 'LinkedIn',
  },
}

export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('de')) return 'de'
  return 'en'
}

export function getTranslations(lang: Language) {
  return translations[lang]
}
