import { Dictionary } from "./en";

export const de: Dictionary = {
  // App
  appTitle: "UniFi Voucher Manager",
  appTitleShort: "UVM",

  // Header controls
  headerOpenKiosk: "Kiosk öffnen",
  headerOpenWifiQr: "WLAN-QR-Code öffnen",
  headerQrIconAlt: "QR-Code-Symbol",
  headerSignOut: "Abmelden",
  headerLogout: "Abmelden",
  headerSwitchLanguage: "Sprache wechseln",
  headerSwitchTheme: "Design wechseln",

  // Tabs
  tabViewVouchers: "Gutscheine",
  tabQuickCreate: "Schnell erstellen",
  tabCustomCreate: "Erweitert erstellen",

  // Forms — shared
  formDuration: "Gültigkeit",
  formName: "Name",
  formCount: "Anzahl",
  formGuestLimit: "Gäste-Limit",
  formDataLimit: "Datenlimit (MB)",
  formDownloadKbps: "Download (Kbps)",
  formUploadKbps: "Upload (Kbps)",
  formUnlimited: "Unbegrenzt",
  formMinutes: "Minuten",
  formHours: "Stunden",
  formDays: "Tage",

  // Quick create
  quickOneDay: "1 Tag",
  quickOneWeek: "1 Woche",
  quickOneYear: "1 Jahr",
  quickDefaultName: "Schnell-Gutschein",
  quickBtnCreate: "Gutschein erstellen",

  // Custom create
  customDefaultName: "Eigener Gutschein",
  customBtnCreate: "Eigenen Gutschein erstellen",
  customErrDurationPositive: "Gültigkeit muss eine positive Zahl sein",
  customErrDurationMax:
    "Gültigkeit zu lang. Maximal erlaubt sind {max} Minuten.",

  // Create — shared state / errors
  createBtnCreating: "Wird erstellt…",
  createErrNoVoucherInResponse:
    "Gutschein wurde erstellt, aber die Daten wurden nicht in der Antwort gefunden",
  createErrFailed: "Gutschein konnte nicht erstellt werden",

  // Vouchers tab
  vouchersSearchPlaceholder: "Gutscheine nach Name suchen...",
  vouchersEditMode: "Bearbeiten",
  vouchersRefresh: "Aktualisieren",
  vouchersShowUsed: "Verbrauchte anzeigen",
  vouchersSelectAll: "Alle auswählen",
  vouchersPrintTile: "Drucken (Kacheln)",
  vouchersPrintList: "Drucken (Liste)",
  vouchersDeleteSelected: "Auswahl löschen",
  vouchersDeleteExpired: "Abgelaufene löschen",
  vouchersCancel: "Abbrechen",
  vouchersSelected: "{count} ausgewählt",
  vouchersShowingXofY: "Zeige {shown} von {total} Gutscheinen",
  vouchersEmpty: "Keine Gutscheine gefunden",
  vouchersEmptySearch: "Keine Gutscheine passen zur Suche",
  vouchersLoadFailed: "Gutscheine konnten nicht geladen werden",
  vouchersDeletedSelectedSingle: "1 Gutschein erfolgreich gelöscht",
  vouchersDeletedSelectedMany: "{count} Gutscheine erfolgreich gelöscht",
  vouchersDeletedExpiredSingle: "1 abgelaufener Gutschein erfolgreich gelöscht",
  vouchersDeletedExpiredMany:
    "{count} abgelaufene Gutscheine erfolgreich gelöscht",
  vouchersNoneDeletedSelected: "Es wurden keine Gutscheine gelöscht",
  vouchersNoneDeletedExpired: "Es wurden keine abgelaufenen Gutscheine gelöscht",
  vouchersFailedDeleteSelected: "Gutscheine konnten nicht gelöscht werden",
  vouchersFailedDeleteExpired:
    "Abgelaufene Gutscheine konnten nicht gelöscht werden",

  // Voucher card labels
  cardGuestsUsed: "Genutzt von:",
  cardSessionTime: "Sitzungsdauer:",
  cardFirstUsed: "Erstmals genutzt:",
  cardExpires: "Läuft ab:",

  // Voucher status
  status_expired: "Abgelaufen",
  status_used: "Verbraucht",
  status_active: "Aktiv",
  status_available: "Verfügbar",

  // Modals / shared
  modalClose: "Schließen",
  successVoucherCreated: "Gutschein erstellt!",
  wifiQrTitle: "WLAN-QR-Code",
  wifiQrScanHint: "Scanne diesen QR-Code, um dem Netzwerk beizutreten",

  // Voucher details modal
  detailsLoadFailed: "Detailinformationen konnten nicht geladen werden",
  detailsStatus: "Status",
  detailsName: "Name",
  detailsNoNote: "Keine Notiz",
  detailsCreated: "Erstellt",
  detailsActivated: "Aktiviert",
  detailsExpires: "Läuft ab",
  detailsDuration: "Gültigkeit",
  detailsGuestUsage: "Gäste-Nutzung",
  detailsDataLimit: "Datenlimit",
  detailsDownloadSpeed: "Download-Geschwindigkeit",
  detailsUploadSpeed: "Upload-Geschwindigkeit",
  detailsId: "ID",

  // Voucher code actions
  codeCopy: "Code kopieren",
  codePrint: "Gutschein drucken",
  codeCopied: "Code in die Zwischenablage kopiert!",
  codeCopyFailed: "Code konnte nicht kopiert werden",

  // Wi-Fi QR
  wifiScanToJoin: "Scannen, um zu verbinden mit",
  wifiNoCredentials: "Keine WLAN-Zugangsdaten konfiguriert.",

  // Welcome page
  welcomeGreeting: "Willkommen!",
  welcomeGreetingPrefix: "Willkommen bei ",
  welcomeGreetingSuffix: "!",

  // Kiosk page
  kioskLoadError: "Rolling-Gutschein konnte nicht geladen werden",
  kioskVoucherCode: "Gutschein-Code",
  kioskNoVoucher: "Kein Gutschein verfügbar",

  // Print page
  printVoucherTitle: "WLAN-Zugangsgutschein",
  printMaxGuests: "Max. Gäste",
  printDataLimit: "Datenlimit",
  printDownSpeed: "Download",
  printUpSpeed: "Upload",
  printScanToConnect: "Zum Verbinden scannen",
  printNetwork: "Netzwerk:",
  printPassword: "Passwort:",
  printNoPassword: "Kein Passwort",
  printHiddenNetwork: "(Verstecktes Netzwerk)",
  printId: "ID:",
  printPrinted: "Gedruckt:",
  printNoVouchers: "Keine Gutscheine zum Drucken, Backspace drücken",
  printQrTitle: "WLAN-Zugangs-QR-Code",
};
