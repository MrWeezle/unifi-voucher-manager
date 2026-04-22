export const en = {
  // App
  appTitle: "UniFi Voucher Manager",
  appTitleShort: "UVM",

  // Header controls
  headerOpenKiosk: "Open Kiosk",
  headerOpenWifiQr: "Open Wi-Fi QR code",
  headerQrIconAlt: "QR code icon",
  headerSignOut: "Sign out",
  headerLogout: "Logout",
  headerSwitchLanguage: "Switch language",
  headerSwitchTheme: "Switch theme",

  // Tabs
  tabViewVouchers: "View Vouchers",
  tabQuickCreate: "Quick Create",
  tabCustomCreate: "Custom Create",

  // Forms — shared
  formDuration: "Duration",
  formName: "Name",
  formCount: "Number",
  formGuestLimit: "Guest Limit",
  formDataLimit: "Data Limit (MB)",
  formDownloadKbps: "Download Kbps",
  formUploadKbps: "Upload Kbps",
  formUnlimited: "Unlimited",
  formMinutes: "Minutes",
  formHours: "Hours",
  formDays: "Days",

  // Quick create
  quickOneDay: "1 Day",
  quickOneWeek: "1 Week",
  quickOneYear: "1 Year",
  quickDefaultName: "Quick Voucher",
  quickBtnCreate: "Create Voucher",

  // Custom create
  customDefaultName: "Custom Voucher",
  customBtnCreate: "Create Custom Voucher",
  customErrDurationPositive: "Duration must be a positive number",
  customErrDurationMax: "Duration too long. Maximum allowed is {max} minutes.",

  // Create — shared state / errors
  createBtnCreating: "Creating…",
  createErrNoVoucherInResponse:
    "Voucher created, but its data was found in response",
  createErrFailed: "Failed to create voucher",

  // Vouchers tab
  vouchersSearchPlaceholder: "Search vouchers by name...",
  vouchersEditMode: "Edit Mode",
  vouchersRefresh: "Refresh",
  vouchersShowUsed: "Show used",
  vouchersSelectAll: "Select All",
  vouchersPrintTile: "Print (Tile)",
  vouchersPrintList: "Print (List)",
  vouchersDeleteSelected: "Delete Selected",
  vouchersDeleteExpired: "Delete Expired",
  vouchersCancel: "Cancel",
  vouchersSelected: "{count} selected",
  vouchersShowingXofY: "Showing {shown} of {total} vouchers",
  vouchersEmpty: "No vouchers found",
  vouchersEmptySearch: "No vouchers found matching your search",
  vouchersLoadFailed: "Failed to load vouchers",
  vouchersDeletedSelectedSingle: "Successfully deleted 1 voucher",
  vouchersDeletedSelectedMany: "Successfully deleted {count} vouchers",
  vouchersDeletedExpiredSingle: "Successfully deleted 1 expired voucher",
  vouchersDeletedExpiredMany: "Successfully deleted {count} expired vouchers",
  vouchersNoneDeletedSelected: "No vouchers were deleted",
  vouchersNoneDeletedExpired: "No expired vouchers were deleted",
  vouchersFailedDeleteSelected: "Failed to delete vouchers",
  vouchersFailedDeleteExpired: "Failed to delete expired vouchers",

  // Voucher card labels
  cardGuestsUsed: "Guests Used:",
  cardSessionTime: "Session Time:",
  cardFirstUsed: "First Used:",
  cardExpires: "Expires:",

  // Voucher status
  status_expired: "Expired",
  status_used: "Used",
  status_active: "Active",
  status_available: "Available",

  // Modals / shared
  modalClose: "Close",
  successVoucherCreated: "Voucher Created!",
  wifiQrTitle: "Wi-Fi QR Code",
  wifiQrScanHint: "Scan this QR code to join the network",

  // Voucher details modal
  detailsLoadFailed: "Failed to load detailed information",
  detailsStatus: "Status",
  detailsName: "Name",
  detailsNoNote: "No note",
  detailsCreated: "Created",
  detailsActivated: "Activated",
  detailsExpires: "Expires",
  detailsDuration: "Duration",
  detailsGuestUsage: "Guest Usage",
  detailsDataLimit: "Data Limit",
  detailsDownloadSpeed: "Download Speed",
  detailsUploadSpeed: "Upload Speed",
  detailsId: "ID",

  // Voucher code actions
  codeCopy: "Copy Code",
  codePrint: "Print Voucher",
  codeCopied: "Code copied to clipboard!",
  codeCopyFailed: "Failed to copy code",

  // Wi-Fi QR
  wifiScanToJoin: "Scan to join",
  wifiNoCredentials: "No Wi-Fi credentials configured.",

  // Welcome page
  welcomeGreeting: "Welcome!",
  welcomeGreetingPrefix: "Welcome to ",
  welcomeGreetingSuffix: "!",

  // Kiosk page
  kioskLoadError: "Could not load rolling voucher",
  kioskVoucherCode: "Voucher Code",
  kioskNoVoucher: "No voucher available",

  // Print page
  printVoucherTitle: "WiFi Access Voucher",
  printMaxGuests: "Max Guests",
  printDataLimit: "Data Limit",
  printDownSpeed: "Down Speed",
  printUpSpeed: "Up Speed",
  printScanToConnect: "Scan to Connect",
  printNetwork: "Network:",
  printPassword: "Password:",
  printNoPassword: "No Password",
  printHiddenNetwork: "(Hidden Network)",
  printId: "ID:",
  printPrinted: "Printed:",
  printNoVouchers: "No vouchers to print, press backspace",
  printQrTitle: "Wi-Fi Access QR Code",
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
