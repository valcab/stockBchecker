export type Language = 'en' | 'fr' | 'de' | 'es' | 'it'

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
    noResultsTitle: 'No tracked items yet',
    noResultsDescription: 'Track a Thomann product page or add a URL above to start monitoring B-Stock availability.',
    noResultsAction: 'Show quick intro',
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
    bStockLink: 'B-Stock',
    onboardingButton: 'Show quick intro',
    onboardingSkip: 'Skip',
    onboardingNext: 'Next',
    onboardingDone: 'Done',
    onboardingTitle: 'Quick Start',
    onboardingStep1Title: 'Track from product pages',
    onboardingStep1Description: 'Open a Thomann product page and use the floating button to start or stop tracking instantly.',
    onboardingStep2Title: 'Enable auto-check + notifications',
    onboardingStep2Description: 'Turn on automatic checks in Settings and keep notifications enabled so B-Stock alerts surface automatically.',
    filtersButton: 'Filters',
    filtersDescription: 'Filter by text, status, or B-Stock availability.',
    filtersSearch: 'Search',
    filtersSearchPlaceholder: 'Name, URL or article ID',
    filtersStatus: 'Status',
    filtersAll: 'All',
    filtersAvailable: 'Available',
    filtersUnavailable: 'Unavailable',
    filtersChecking: 'Checking',
    filtersError: 'Error',
    filtersBStock: 'B-Stock',
    filtersBStockAvailable: 'Available only',
    filtersBStockMissing: 'Not available',
    filtersSort: 'Sort',
    filtersSortDefault: 'Available first',
    filtersSortNewest: 'Last checked: newest',
    filtersSortOldest: 'Last checked: oldest',
    filtersSortNameAsc: 'Name: A to Z',
    filtersSortNameDesc: 'Name: Z to A',
    filtersSortPriceAsc: 'Price: low to high',
    filtersSortPriceDesc: 'Price: high to low',
    filtersReset: 'Reset',
    filtersEmpty: 'No items match the current filters.',
    filtersEmptyTitle: 'No matching items',
    filtersEmptyDescription: 'Adjust or clear your filters to bring matching tracked items back into view.',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    themeSystemLabel: 'Follow device theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    autoCheckLastRun: 'Last automatic check',
    autoCheckNextRun: 'Next scheduled check',
    autoCheckNotScheduled: 'Not scheduled',
    notificationCooldownLabel: 'Notification cooldown',
    notificationCooldownValue: '1 hour per item while it stays available',
    importButton: 'Import',
    exportButton: 'Export',
    importExportTitle: 'Backup',
    importSuccess: 'Tracked items imported.',
    importInvalid: 'Invalid import file.',
    exportEmpty: 'No tracked items to export.',
    
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
    inputPlaceholder: 'Entrez une URL thomann',
    addButton: 'Ajouter',
    
    // Tabs
    tabResults: 'Résultats',
    tabItems: 'Articles',
    tabSettings: 'Paramètres',
    
    // Results
    noResults: 'Aucun résultat pour le moment. Ajoutez des articles et vérifiez-les !',
    noResultsTitle: 'Aucun article suivi',
    noResultsDescription: 'Suivez une page produit Thomann ou ajoutez une URL ci-dessus pour commencer à surveiller le Stock B.',
    noResultsAction: 'Afficher l’intro',
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
    deleteConfirmDescription: 'Cela supprimera le suivi et le résultat associé.',
    bStockLink: 'B-Stock',
    onboardingButton: 'Afficher l’intro',
    onboardingSkip: 'Passer',
    onboardingNext: 'Suivant',
    onboardingDone: 'Terminer',
    onboardingTitle: 'Démarrage rapide',
    onboardingStep1Title: 'Suivre depuis la page produit',
    onboardingStep1Description: 'Ouvrez une page produit Thomann et utilisez le bouton flottant pour démarrer ou arrêter le suivi instantanément.',
    onboardingStep2Title: 'Activer auto-check + notifications',
    onboardingStep2Description: 'Activez les vérifications automatiques dans Paramètres et laissez les notifications actives pour recevoir les alertes Stock B.',
    filtersButton: 'Filtres',
    filtersDescription: 'Filtrer par texte, statut ou disponibilité Stock B.',
    filtersSearch: 'Recherche',
    filtersSearchPlaceholder: 'Nom, URL ou ID article',
    filtersStatus: 'Statut',
    filtersAll: 'Tous',
    filtersAvailable: 'Disponible',
    filtersUnavailable: 'Indisponible',
    filtersChecking: 'Vérification',
    filtersError: 'Erreur',
    filtersBStock: 'Stock B',
    filtersBStockAvailable: 'Disponible seulement',
    filtersBStockMissing: 'Non disponible',
    filtersSort: 'Tri',
    filtersSortDefault: 'Disponibles en premier',
    filtersSortNewest: 'Dernière vérification : récentes',
    filtersSortOldest: 'Dernière vérification : anciennes',
    filtersSortNameAsc: 'Nom : A à Z',
    filtersSortNameDesc: 'Nom : Z à A',
    filtersSortPriceAsc: 'Prix : croissant',
    filtersSortPriceDesc: 'Prix : décroissant',
    filtersReset: 'Réinitialiser',
    filtersEmpty: 'Aucun article ne correspond aux filtres.',
    filtersEmptyTitle: 'Aucun article correspondant',
    filtersEmptyDescription: 'Ajustez ou réinitialisez les filtres pour revoir vos articles suivis.',
    languageLabel: 'Langue',
    themeLabel: 'Thème',
    themeSystemLabel: 'Suivre le thème du système',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    autoCheckLastRun: 'Dernière vérification automatique',
    autoCheckNextRun: 'Prochaine vérification planifiée',
    autoCheckNotScheduled: 'Non planifiée',
    notificationCooldownLabel: 'Délai entre notifications',
    notificationCooldownValue: '1 heure par article tant qu’il reste disponible',
    importButton: 'Importer',
    exportButton: 'Exporter',
    importExportTitle: 'Sauvegarde',
    importSuccess: 'Articles suivis importés.',
    importInvalid: 'Fichier d’import invalide.',
    exportEmpty: 'Aucun article à exporter.',
    
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
    noResultsTitle: 'Noch keine verfolgten Artikel',
    noResultsDescription: 'Verfolgen Sie eine Thomann-Produktseite oder fugen Sie oben eine URL hinzu, um die B-Stock-Uberwachung zu starten.',
    noResultsAction: 'Kurze Einfuhrung',
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
    bStockLink: 'B-Stock',
    onboardingButton: 'Kurze Einfuhrung',
    onboardingSkip: 'Uberspringen',
    onboardingNext: 'Weiter',
    onboardingDone: 'Fertig',
    onboardingTitle: 'Schnellstart',
    onboardingStep1Title: 'Auf Produktseiten verfolgen',
    onboardingStep1Description: 'Offnen Sie eine Thomann-Produktseite und nutzen Sie den schwebenden Button, um Tracking sofort zu starten oder zu stoppen.',
    onboardingStep2Title: 'Auto-Check + Benachrichtigungen aktivieren',
    onboardingStep2Description: 'Aktivieren Sie automatische Prufungen in den Einstellungen und lassen Sie Benachrichtigungen aktiv.',
    filtersButton: 'Filter',
    filtersDescription: 'Nach Text, Status oder B-Stock-Verfugbarkeit filtern.',
    filtersSearch: 'Suche',
    filtersSearchPlaceholder: 'Name, URL oder Artikel-ID',
    filtersStatus: 'Status',
    filtersAll: 'Alle',
    filtersAvailable: 'Verfugbar',
    filtersUnavailable: 'Nicht verfugbar',
    filtersChecking: 'Prufung',
    filtersError: 'Fehler',
    filtersBStock: 'B-Stock',
    filtersBStockAvailable: 'Nur verfugbar',
    filtersBStockMissing: 'Nicht verfugbar',
    filtersSort: 'Sortierung',
    filtersSortDefault: 'Verfugbare zuerst',
    filtersSortNewest: 'Letzte Prufung: neueste',
    filtersSortOldest: 'Letzte Prufung: alteste',
    filtersSortNameAsc: 'Name: A bis Z',
    filtersSortNameDesc: 'Name: Z bis A',
    filtersSortPriceAsc: 'Preis: niedrig bis hoch',
    filtersSortPriceDesc: 'Preis: hoch bis niedrig',
    filtersReset: 'Zurucksetzen',
    filtersEmpty: 'Keine Artikel entsprechen den Filtern.',
    filtersEmptyTitle: 'Keine passenden Artikel',
    filtersEmptyDescription: 'Passen Sie die Filter an oder setzen Sie sie zuruck, um Ihre verfolgten Artikel wieder anzuzeigen.',
    languageLabel: 'Sprache',
    themeLabel: 'Design',
    themeSystemLabel: 'Systemdesign folgen',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    autoCheckLastRun: 'Letzte automatische Prufung',
    autoCheckNextRun: 'Naechste geplante Prufung',
    autoCheckNotScheduled: 'Nicht geplant',
    notificationCooldownLabel: 'Benachrichtigungsabstand',
    notificationCooldownValue: '1 Stunde pro Artikel solange er verfugbar bleibt',
    importButton: 'Importieren',
    exportButton: 'Exportieren',
    importExportTitle: 'Sicherung',
    importSuccess: 'Verfolgte Artikel importiert.',
    importInvalid: 'Ungultige Importdatei.',
    exportEmpty: 'Keine Artikel zum Exportieren.',
    
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
  es: {
    // Header
    title: 'B-Stock Beacon',

    // Add item
    inputPlaceholder: 'Introduce una URL o un ID',
    addButton: 'Anadir',

    // Tabs
    tabResults: 'Resultados',
    tabItems: 'Articulos',
    tabSettings: 'Ajustes',

    // Results
    noResults: 'Todavia no hay resultados. Anade articulos y compruebalos.',
    noResultsTitle: 'Todavia no hay articulos seguidos',
    noResultsDescription: 'Sigue una pagina de producto de Thomann o anade una URL arriba para empezar a vigilar la disponibilidad de B-Stock.',
    noResultsAction: 'Mostrar introduccion',
    available: 'B-Stock disponible',
    unavailable: 'B-Stock no disponible',
    checking: 'Comprobando...',
    checkedAt: 'Comprobado a las',

    // Items
    noItems: 'Todavia no hay articulos seguidos',
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    selected: 'seleccionado(s)',

    // Settings
    settingsTitle: 'Ajustes de comprobacion automatica',
    autoCheckLabel: 'Activar comprobaciones automaticas',
    checkIntervalLabel: 'Comprobar cada:',
    notificationsLabel: 'Mostrar notificaciones cuando se encuentre B-Stock',
    clearAllButton: 'Borrar todo',
    removeButton: 'Eliminar',
    cancelButton: 'Cancelar',
    confirmDeleteButton: 'Eliminar',
    deleteConfirmTitle: 'Eliminar este articulo?',
    deleteConfirmDescription: 'Esto eliminara el seguimiento y el resultado.',
    bStockLink: 'B-Stock',
    onboardingButton: 'Mostrar introduccion',
    onboardingSkip: 'Omitir',
    onboardingNext: 'Siguiente',
    onboardingDone: 'Listo',
    onboardingTitle: 'Inicio rapido',
    onboardingStep1Title: 'Seguir desde paginas de producto',
    onboardingStep1Description: 'Abre una pagina de producto de Thomann y usa el boton flotante para iniciar o detener el seguimiento al instante.',
    onboardingStep2Title: 'Activar auto-check + notificaciones',
    onboardingStep2Description: 'Activa las comprobaciones automaticas en Ajustes y mantén las notificaciones activas para recibir alertas de B-Stock.',
    filtersButton: 'Filtros',
    filtersDescription: 'Filtra por texto, estado o disponibilidad de B-Stock.',
    filtersSearch: 'Buscar',
    filtersSearchPlaceholder: 'Nombre, URL o ID del articulo',
    filtersStatus: 'Estado',
    filtersAll: 'Todos',
    filtersAvailable: 'Disponible',
    filtersUnavailable: 'No disponible',
    filtersChecking: 'Comprobando',
    filtersError: 'Error',
    filtersBStock: 'B-Stock',
    filtersBStockAvailable: 'Solo disponibles',
    filtersBStockMissing: 'No disponible',
    filtersSort: 'Ordenar',
    filtersSortDefault: 'Disponibles primero',
    filtersSortNewest: 'Ultima comprobacion: mas reciente',
    filtersSortOldest: 'Ultima comprobacion: mas antigua',
    filtersSortNameAsc: 'Nombre: A a Z',
    filtersSortNameDesc: 'Nombre: Z a A',
    filtersSortPriceAsc: 'Precio: menor a mayor',
    filtersSortPriceDesc: 'Precio: mayor a menor',
    filtersReset: 'Restablecer',
    filtersEmpty: 'Ningun articulo coincide con los filtros actuales.',
    filtersEmptyTitle: 'No hay articulos coincidentes',
    filtersEmptyDescription: 'Ajusta o limpia los filtros para volver a mostrar los articulos seguidos.',
    languageLabel: 'Idioma',
    themeLabel: 'Tema',
    themeSystemLabel: 'Seguir el tema del dispositivo',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    autoCheckLastRun: 'Ultima comprobacion automatica',
    autoCheckNextRun: 'Proxima comprobacion programada',
    autoCheckNotScheduled: 'No programada',
    notificationCooldownLabel: 'Intervalo entre notificaciones',
    notificationCooldownValue: '1 hora por articulo mientras siga disponible',
    importButton: 'Importar',
    exportButton: 'Exportar',
    importExportTitle: 'Copia de seguridad',
    importSuccess: 'Articulos seguidos importados.',
    importInvalid: 'Archivo de importacion no valido.',
    exportEmpty: 'No hay articulos para exportar.',

    // Check button
    checkAllButton: 'Comprobar todos los articulos',

    // Intervals
    interval1min: '1 minuto',
    interval5min: '5 minutos',
    interval15min: '15 minutos',
    interval30min: '30 minutos',
    interval1hour: '1 hora',
    interval2hours: '2 horas',
    interval6hours: '6 horas',

    // Alerts
    alertEnterUrl: 'Introduce una URL o un ID de articulo',
    alertInvalidUrl: 'URL o ID de articulo no valido',
    alertAlreadyTracked: 'Este articulo ya se esta siguiendo',
    alertNoItems: 'No hay articulos que comprobar',
    alertClearConfirm: 'Seguro que quieres eliminar todos los articulos seleccionados?',

    // Other
    article: 'Articulo',

    // About
    aboutTitle: 'Acerca de esta extension',
    aboutDescription: 'Esta extension te ayuda a seguir la disponibilidad de B-Stock en productos de Thomann. Recibe una notificacion cuando tu equipo favorito este disponible a un gran precio.',
    madeBy: 'Creado por',
    website: 'Sitio web',
    linkedin: 'LinkedIn',
  },
  it: {
    // Header
    title: 'B-Stock Beacon',

    // Add item
    inputPlaceholder: 'Inserisci URL o ID',
    addButton: 'Aggiungi',

    // Tabs
    tabResults: 'Risultati',
    tabItems: 'Articoli',
    tabSettings: 'Impostazioni',

    // Results
    noResults: 'Nessun risultato per ora. Aggiungi articoli e controllali.',
    noResultsTitle: 'Nessun articolo monitorato',
    noResultsDescription: 'Monitora una pagina prodotto Thomann o aggiungi un URL qui sopra per iniziare a seguire la disponibilita B-Stock.',
    noResultsAction: 'Mostra introduzione',
    available: 'B-Stock disponibile',
    unavailable: 'B-Stock non disponibile',
    checking: 'Controllo in corso...',
    checkedAt: 'Controllato alle',

    // Items
    noItems: 'Nessun articolo monitorato',
    selectAll: 'Seleziona tutto',
    deselectAll: 'Deseleziona tutto',
    selected: 'selezionato/i',

    // Settings
    settingsTitle: 'Impostazioni controllo automatico',
    autoCheckLabel: 'Attiva controlli automatici',
    checkIntervalLabel: 'Controlla ogni:',
    notificationsLabel: 'Mostra notifiche quando viene trovato B-Stock',
    clearAllButton: 'Cancella tutto',
    removeButton: 'Rimuovi',
    cancelButton: 'Annulla',
    confirmDeleteButton: 'Elimina',
    deleteConfirmTitle: 'Rimuovere questo articolo?',
    deleteConfirmDescription: 'Questo rimuovera il monitoraggio e il risultato.',
    bStockLink: 'B-Stock',
    onboardingButton: 'Mostra introduzione',
    onboardingSkip: 'Salta',
    onboardingNext: 'Avanti',
    onboardingDone: 'Fine',
    onboardingTitle: 'Avvio rapido',
    onboardingStep1Title: 'Monitora dalle pagine prodotto',
    onboardingStep1Description: 'Apri una pagina prodotto Thomann e usa il pulsante flottante per avviare o interrompere subito il monitoraggio.',
    onboardingStep2Title: 'Attiva auto-check + notifiche',
    onboardingStep2Description: 'Attiva i controlli automatici nelle Impostazioni e mantieni attive le notifiche per ricevere gli avvisi B-Stock.',
    filtersButton: 'Filtri',
    filtersDescription: 'Filtra per testo, stato o disponibilita B-Stock.',
    filtersSearch: 'Cerca',
    filtersSearchPlaceholder: 'Nome, URL o ID articolo',
    filtersStatus: 'Stato',
    filtersAll: 'Tutti',
    filtersAvailable: 'Disponibile',
    filtersUnavailable: 'Non disponibile',
    filtersChecking: 'Controllo',
    filtersError: 'Errore',
    filtersBStock: 'B-Stock',
    filtersBStockAvailable: 'Solo disponibili',
    filtersBStockMissing: 'Non disponibile',
    filtersSort: 'Ordina',
    filtersSortDefault: 'Disponibili prima',
    filtersSortNewest: 'Ultimo controllo: piu recente',
    filtersSortOldest: 'Ultimo controllo: piu vecchio',
    filtersSortNameAsc: 'Nome: A a Z',
    filtersSortNameDesc: 'Nome: Z a A',
    filtersSortPriceAsc: 'Prezzo: crescente',
    filtersSortPriceDesc: 'Prezzo: decrescente',
    filtersReset: 'Reimposta',
    filtersEmpty: 'Nessun articolo corrisponde ai filtri correnti.',
    filtersEmptyTitle: 'Nessun articolo corrispondente',
    filtersEmptyDescription: 'Modifica o azzera i filtri per visualizzare di nuovo gli articoli monitorati.',
    languageLabel: 'Lingua',
    themeLabel: 'Tema',
    themeSystemLabel: 'Segui il tema del dispositivo',
    themeLight: 'Chiaro',
    themeDark: 'Scuro',
    autoCheckLastRun: 'Ultimo controllo automatico',
    autoCheckNextRun: 'Prossimo controllo pianificato',
    autoCheckNotScheduled: 'Non pianificato',
    notificationCooldownLabel: 'Intervallo tra notifiche',
    notificationCooldownValue: '1 ora per articolo finche resta disponibile',
    importButton: 'Importa',
    exportButton: 'Esporta',
    importExportTitle: 'Backup',
    importSuccess: 'Articoli monitorati importati.',
    importInvalid: 'File di importazione non valido.',
    exportEmpty: 'Nessun articolo da esportare.',

    // Check button
    checkAllButton: 'Controlla tutti gli articoli',

    // Intervals
    interval1min: '1 minuto',
    interval5min: '5 minuti',
    interval15min: '15 minuti',
    interval30min: '30 minuti',
    interval1hour: '1 ora',
    interval2hours: '2 ore',
    interval6hours: '6 ore',

    // Alerts
    alertEnterUrl: 'Inserisci un URL o un ID articolo',
    alertInvalidUrl: 'URL o ID articolo non valido',
    alertAlreadyTracked: 'Questo articolo e gia monitorato',
    alertNoItems: 'Nessun articolo da controllare',
    alertClearConfirm: 'Sei sicuro di voler eliminare tutti gli articoli selezionati?',

    // Other
    article: 'Articolo',

    // About
    aboutTitle: 'Informazioni su questa estensione',
    aboutDescription: 'Questa estensione ti aiuta a monitorare la disponibilita del B-Stock sui prodotti Thomann. Ricevi una notifica quando la tua attrezzatura preferita diventa disponibile a un ottimo prezzo.',
    madeBy: 'Creato da',
    website: 'Sito web',
    linkedin: 'LinkedIn',
  },
}

export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('de')) return 'de'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('it')) return 'it'
  return 'en'
}

export function getTranslations(lang: Language) {
  return translations[lang]
}
