// Authentication & Authorization
export const DEFAULT_USER_ROLE = 'admin' as const;
export const ALLOWED_USER_ROLES = ['admin', 'staff', 'secretary'] as const;
export type UserRole = (typeof ALLOWED_USER_ROLES)[number];

export const AUTH_PAGES = ['/'] as const;
export const PUBLIC_ROUTES = ['/'] as const;

export const ROLE_TRANSLATIONS: Record<UserRole, string> = {
  admin: 'Διαχειριστής',
  staff: 'Υπάλληλος', 
  secretary: 'Γραμματεία'
} as const;

// UI Components & Icons
import { Search, Euro } from "lucide-react";

// Sales Interface Icons
export const SALES_ICONS = {
  SEARCH: Search,
  EURO: Euro
} as const;

export const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512] as const;

export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

export const PASSWORD_MIN_LENGTH = 1;
export const DEFAULT_ITEMS_PER_PAGE = 10;

// Business Logic - Inventory
export const UNLIMITED_STOCK = -1;
export const UNLIMITED_CATEGORY_ID = '250f2320-b578-4344-80f8-1addf0bf8b3f';
export const LOW_STOCK_THRESHOLD = 10;

// Business Logic - Payments & Pricing
export const EXTRA_SHOT_PRICE = 0.50;
export const CARD_DISCOUNT = 2.00; // Fixed 2€ discount per coupon applied to the total bill

export const PAYMENT_METHOD_LABELS = {
  cash: 'Μετρητά',
  card: 'Κουπόνια',
  treat: 'Κέρασμα'
} as const;

// Business Logic - Statistics
export const STATISTICS = {
  DEFAULT_TOP_CODES_COUNT: 5,
  MIN_TOP_CODES_COUNT: 3,
  MAX_TOP_CODES_COUNT: 10,
  DEFAULT_DAYS_TO_SHOW: 7,
  MIN_DAYS_TO_SHOW: 3,
  MAX_DAYS_TO_SHOW: 30,
} as const;

// Date Formatting
export const DATE_FORMAT = {
  DISPLAY: "dd/MM/yyyy",
  API: "yyyy-MM-dd",
  FULL_WITH_TIME: "d MMMM yyyy, HH:mm"
} as const;

export const QUICK_SELECT_OPTIONS = {
  CUSTOM: "Προσαρμοσμένη",
  TODAY: "Σήμερα",
  YESTERDAY: "Χθες",
  THIS_WEEK: "Αυτή την εβδομάδα",
  LAST_WEEK: "Προηγούμενη εβδομάδα",
  THIS_MONTH: "Τρέχων μήνας",
  LAST_MONTH: "Πρηγούμενος μήνας",
  THIS_YEAR: "Τρέχον έτος",
  LAST_YEAR: "Προηγούμενο έτος"
} as const;

export const REQUIRED_FIELDS_MESSAGE = "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία";

// UI Messages - API Errors
export const API_ERROR_MESSAGES = {
  UNAUTHORIZED: "Μη εξουσιοδοτημένη πρόσβαση",
  INVALID_CREDENTIALS: "Λανθασμένα στοιχεία σύνδεσης",
  USER_NOT_FOUND: "Ο χρήστης δεν βρέθηκε",
  INVALID_ROLE: "Μη έγκυρος ρόλος",
  INVALID_TOKEN: "Μη έγκυρο token",
  EXPIRED_TOKEN: "Το token έχει λήξει",
  INVALID_REQUEST: "Μη έγκυρο αίτημα",
  SERVER_ERROR: "Σφάλμα διακομιστή",
  TOO_MANY_ATTEMPTS: "Πάρα πολλές προσπάθειες σύνδεσης. Παρακαλώ δοκιμάστε ξανά αργότερα",
  FETCH_CATEGORIES_ERROR: "Σφάλμα κατά την ανάκτηση των κατηγοριών",
  CHECK_CODE_ERROR: "Σφάλμα κατά τον έλεγχο του κωδικού",
  CODE_EXISTS: "Ο κωδικός υπάρχει ήδη",
  AUTH_ERROR: "Σφάλμα ταυτοποίησης χρήστη",
  UPLOAD_ERROR: "Σφάλμα κατά το ανέβασμα της εικόνας",
  CREATE_CODE_ERROR: "Σφάλμα κατά την δημιουργία του κωδικού",
  CODE_CREATED: "Ο κωδικός δημιουργήθηκε επιτυχώς",
  GENERIC_ERROR: "Κάτι πήγε στραβά",
  INVALID_IMAGE_TYPE: "Παρακαλώ επιλέξτε μια εικόνα",
  IMAGE_TOO_LARGE: "Η εικόνα δεν πρέπει να ξεπερνά τα 5MB",
  MISSING_REQUIRED_FIELDS: REQUIRED_FIELDS_MESSAGE
} as const;

// UI Messages - Dialogs
export const DIALOG_MESSAGES = {
  CONFIRM_BUTTON_DEFAULT: 'Επιβεβαίωση',
  CANCEL_BUTTON_DEFAULT: 'Άκυρο',
  LOADING_TEXT_DEFAULT: 'Παρακαλώ περιμένετε...',
  SAVE_BUTTON: 'Αποθήκευση',
  SAVE_LOADING: 'Αποθήκευση...',
  DELETE_BUTTON: 'Διαγραφή',
  DELETE_LOADING: 'Διαγραφή...',
  CLOSE_BUTTON: 'Κλείσιμο',
  CONTINUE_BUTTON: 'Συνέχεια',
  OFFLINE_BUTTON: 'Επαναλήψη',
  NOT_FOUND_BUTTON: 'Επιστροφή στην αρχική',
  DELETE_BOOKING_TITLE: 'Διαγραφή Κράτησης',
  DELETE_BOOKING_DESCRIPTION: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κράτηση; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.'
} as const;

// UI Messages - User Management
export const USER_MESSAGES = {
  CREATE_SUCCESS: 'Ο χρήστης δημιουργήθηκε επιτυχώς',
  DELETE_SUCCESS: 'Ο χρήστης διαγράφηκε επιτυχώς',
  PASSWORD_RESET_SUCCESS: 'Ο κωδικός άλλαξε επιτυχώς',
  UNEXPECTED_ERROR: 'Απρόσμενο σφάλμα'
} as const;

// UI Messages - Code Management
export const CODE_MESSAGES = {
  CREATE_SUCCESS: 'Ο κωδικός προστέθηκε επιτυχώς',
  UPDATE_SUCCESS: 'Ο κωδικός ενημερώθηκε επιτυχώς',
  DELETE_SUCCESS: 'Ο κωδικός διαγράφηκε επιτυχώς',
  DELETE_CONFIRM: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον κωδικό;',
  GENERIC_ERROR: 'Κάτι πήγε στραβά'
} as const;

// UI Messages - Stock Management
export const STOCK_MESSAGES = {
  UPDATE_SUCCESS: 'Το απόθεμα ενημερώθηκε επιτυχώς',
  UNLIMITED_STOCK_NOTE: 'Το προϊόν αυτό έχει απεριόριστο απόθεμα και δεν μπορεί να τροποποιηθεί.',
  NEW_STOCK_LABEL: 'Νέο Απόθεμα',
  UNLIMITED_STOCK_LABEL: 'Απεριόριστο απόθεμα'
} as const;

// UI Messages - Sales Management
export const SALES_MESSAGES = {
  CREATE_SUCCESS: 'Η πώληση καταχωρήθηκε επιτυχώς',
  UPDATE_SUCCESS: 'Η πώληση ενημερώθηκε επιτυχώς',
  UPDATE_ERROR: 'Σφάλμα κατά την ενημέρωση της πώλησης',
  DELETE_SUCCESS: 'Η πώληση διαγράφηκε επιτυχώς',
  DELETE_ERROR: 'Σφάλμα κατά τη διαγραφή της πώλησης',
  NO_USER_ERROR: 'Δεν βρέθηκε χρήστης',
  NO_ITEMS: 'Δεν έχουν προστεθεί προϊόντα',
  EDIT_WINDOW_EXPIRED: 'Το χρονικό διάστημα επεξεργασίας έχει λήξει',
  PRODUCT_NOT_FOUND: 'Το προϊόν δεν βρέθηκε'
} as const;

// UI Messages - Register Management
export const REGISTER_MESSAGES = {
  NOT_LOGGED_IN: "Πρέπει να συνδεθείτε για να δείτε το ταμείο",
  FETCH_ERROR: "Σφάλμα κατά τη φόρτωση των ταμειακών περιόδων",
  NO_ACTIVE_SESSION: "Δεν υπάρχει ενεργή ταμειακή περίοδος",
  SESSION_CREATED: "Δημιουργήθηκε νέα ταμειακή περίοδος",
  CLOSE_SUCCESS: "Η ταμειακή περίοδος έκλεισε επιτυχώς",
  CLOSE_ERROR: "Σφάλμα κατά το κλείσιμο της ταμειακής περιόδου",
  ALREADY_CLOSED: "Η ταμειακή περίοδος έχει ήδη κλείσει",
  NAME_REQUIRED: "Παρακαλώ εισάγετε το όνομά σας για να κλείσετε το ταμείο"
} as const;

export const REGISTER_DIALOG = {
  TITLE: 'Κλείσιμο Ταμείου',
  CASH_LABEL: 'Μετρητά:',
  CARD_LABEL: 'Κουπόνια:',
  TOTAL_LABEL: 'Σύνολο:',
  CONFIRM_BUTTON: 'Επιβεβαίωση Κλεισίματος',
  CONTINUE_BUTTON: 'Συνέχεια',
} as const;

// UI Messages - Appointments
export const APPOINTMENT_MESSAGES = {
  CREATE_SUCCESS: 'Το παιδικό πάρτυ καταχωρήθηκε με επιτυχία!',
  UPDATE_SUCCESS: 'Το παιδικό πάρτυ ενημερώθηκε με επιτυχία!',
  DELETE_SUCCESS: 'Το παιδικό πάρτυ διαγράφηκε με επιτυχία!',
  DELETE_CONFIRM: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το παιδικό πάρτυ;',
  REQUIRED_FIELDS: REQUIRED_FIELDS_MESSAGE,
  INVALID_DATE: 'Παρακαλώ επιλέξτε μια έγκυρη ημερομηνία και ώρα',
  MIN_CHILDREN: 'Ο αριθμός των παιδιών πρέπει να είναι τουλάχιστον 1',
  MIN_ADULTS: 'Ο αριθμός των ενηλίκων πρέπει να είναι 0 ή μεγαλύτερος',
  GENERIC_ERROR: 'Σφάλμα κατά την καταχώρηση του παιδικού πάρτυ',
  FETCH_ERROR: 'Σφάλμα κατά την ανάκτηση των παιδικών πάρτυ',
  NO_UPCOMING: 'Δεν υπάρχουν προσεχή παιδικά πάρτυ για τις επόμενες 3 ημέρες',
  NO_APPOINTMENTS: 'Δεν υπάρχουν παιδικά πάρτυ'
} as const;

// UI Messages - Football Bookings
export const FOOTBALL_BOOKING_MESSAGES = {
  CREATE_SUCCESS: 'Η κράτηση δημιουργήθηκε με επιτυχία!',
  UPDATE_SUCCESS: 'Η κράτηση ενημερώθηκε με επιτυχία!',
  DELETE_SUCCESS: 'Η κράτηση διαγράφηκε με επιτυχία!',
  DELETE_CONFIRM: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κράτηση;',
  REQUIRED_FIELDS: REQUIRED_FIELDS_MESSAGE,
  INVALID_DATE: 'Παρακαλώ επιλέξτε μια έγκυρη ημερομηνία και ώρα',
  MIN_PLAYERS: 'Ο αριθμός των παικτών πρέπει να είναι μεταξύ 2 και 12',
  INVALID_FIELD: 'Παρακαλώ επιλέξτε ένα έγκυρο γήπεδο (1-5)',
  FIELD_UNAVAILABLE: 'Το γήπεδο {0} είναι ήδη κλεισμένο στις {1}',
  GENERIC_ERROR: 'Σφάλμα κατά τη δημιουργία της κράτησης',
  FETCH_ERROR: 'Σφάλμα κατά την ανάκτηση των κρατήσεων',
  UPDATE_ERROR: 'Σφάλμα κατά την ενημέρωση της κράτησης',
  DELETE_ERROR: 'Σφάλμα κατά τη διαγραφή της κράτησης',
  NO_UPCOMING: 'Δεν υπάρχουν προσεχείς κρατήσεις για τις επόμενες 3 ημέρες',
  NO_BOOKINGS: 'Δεν υπάρχουν κρατήσεις'
} as const;

// UI - Form Labels & Placeholders
export const FORM_LABELS = {
  WHO_BOOKED: 'Ποιος έκλεισε',
  DATE_TIME: 'Ημερομηνία - Ώρα',
  CONTACT_DETAILS: 'Στοιχεία επικοινωνίας',
  NUM_CHILDREN: 'Παιδάκια',
  NUM_ADULTS: 'Ενήλικες',
  NUM_PLAYERS: 'Αριθμός παικτών',
  FIELD_NUMBER: 'Επιλογή γηπέδου',
  NOTES: 'Παρατηρήσεις',
  REQUIRED: '*',
  CREATED_AT: 'Καταχωρήθηκε',
  FIELD: 'Γήπεδο',
  PLAYERS: 'παίκτες'
} as const;

export const PLACEHOLDERS = {
  WHO_BOOKED: 'π.χ. Γιώργος Παπαδόπουλος',
  CONTACT_DETAILS: 'π.χ. 6912345678 ή example@email.com',
  NUM_CHILDREN: 'π.χ. 10',
  NUM_ADULTS: 'π.χ. 5',
  NUM_PLAYERS: 'π.χ. 5',
  NOTES: 'π.χ. Αλλεργίες, ειδικές απαιτήσεις, ή άλλες σημαντικές πληροφορίες'
} as const;

// UI - Button Labels
export const BUTTON_LABELS = {
  SUBMIT: 'Υποβολή...',
  BOOK_APPOINTMENT: 'Κράτηση Παιδικού Πάρτυ',
  BOOK_FIELD: 'Κλείσιμο Γηπέδου',
  EDIT: 'Επεξεργασία',
  DELETE: 'Διαγραφή',
  CANCEL: 'Ακύρωση',
  SAVE: 'Αποθήκευση'
} as const;

// UI - Charts & Visualizations
export const CATEGORY_SALES_CHART = {
  MEDAL_COLORS: {
    GOLD: "text-yellow-400",
    SILVER: "text-gray-400",
    BRONZE: "text-amber-600",
    DEFAULT: "text-transparent"
  },
  EMPTY_STATES: {
    NO_CATEGORY: "Επιλέξτε μια κατηγορία για να δείτε τις πωλήσεις",
    NO_SALES: "Δεν βρέθηκαν πωλήσεις για αυτή την κατηγορία"
  },
  UI: {
    CATEGORY_SELECT_PLACEHOLDER: "Επιλέξτε κατηγορία",
    SELECT_WIDTH: "w-[180px]"
  }
} as const;