// ======= Base Types =======
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ======= Date & Time Types =======
export type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};

// ======= Payment Types =======
export type PaymentMethodType = 'cash' | 'card' | 'treat';

// ======= Calendar Types =======
export type Locale = {
  code?: string;
  formatLong?: Record<string, string>;
  formatRelative?: Record<string, string>;
  localize?: Record<string, string>;
  match?: Record<string, string>;
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: number;
  };
};

// ======= Route Types =======
export type RouteContext<T = Record<string, string>> = {
  params: T;
};

export type RouteHandler<T = Record<string, string>> = (
  request: Request,
  context: RouteContext<T>
) => Promise<Response>;
