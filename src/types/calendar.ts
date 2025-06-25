export type Locale = {
  code?: string
  formatLong?: Record<string, any>
  formatRelative?: Record<string, any>
  localize?: Record<string, any>
  match?: Record<string, any>
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    firstWeekContainsDate?: number
  }
} 