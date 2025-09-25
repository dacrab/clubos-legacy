# 🚀 clubos-legacay — Modern Sports Facility Dashboard (Next.js)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.x-black)
![React](https://img.shields.io/badge/React-19.1.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.x-green)

A comprehensive, role‑based dashboard for sports facility operations: sales, inventory, register sessions, party and football bookings, and analytics — built with Next.js App Router and Supabase.

## ✨ Highlights

- **🎭 Multi‑role access**: Admin, Secretary, Staff
- **🛒 POS & Sales**: Orders, items, discounts, treats, coupons
- **📦 Inventory**: Stock levels, low‑stock alerts, stock updates
- **🏦 Register Sessions**: Open/close sessions with closing details
- **📊 Analytics**: Sales trends, top products, category insights
- **🎉 Party Bookings**: Children’s party scheduling & management
- **⚽ Football Bookings**: 5x5 field reservations
- **🔐 Auth**: Supabase Auth with server/client helpers and middleware guard
- **🌙 Theming**: Dark mode with `next-themes`
- **📱 Responsive UI**: shadcn/ui + Radix, mobile‑friendly tables and lists

## 🧱 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Runtime**: React 19
- **Database & Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Charts**: Recharts 3
- **Forms & Validation**: React Hook Form + Zod
- **Data Fetching**: SWR
- **Animations**: Framer Motion
- **Tooling**: Ultracite (Biome-based), Knip, Bundle Analyzer

## 📂 Project Structure

```text
src/
├── app/                      # App Router routes
│   ├── api/                  # API routes (users, upload)
│   ├── dashboard/            # Main dashboard (guarded by middleware)
│   │   ├── overview/
│   │   ├── history/
│   │   ├── register-closings/
│   │   ├── register-sessions/
│   │   ├── products/
│   │   ├── statistics/
│   │   └── users/
│   ├── loading.tsx           # Root Suspense fallback
│   └── layout.tsx            # Root layout & providers
├── components/
│   ├── auth/
│   ├── dashboard/
│   │   ├── appointments/
│   │   ├── football/
│   │   ├── inventory/
│   │   ├── products/
│   │   ├── register/
│   │   ├── sales/
│   │   └── statistics/
│   ├── providers/            # Theme, error boundary, loading, dashboard provider
│   └── ui/                   # shadcn/ui primitives and wrappers
├── hooks/
├── lib/                      # env, supabase clients, utils, constants
├── types/                    # Database & app types
└── middleware.ts             # Auth guard for /dashboard/*
```

## 🔐 Authentication & Authorization

- Supabase Auth with typed server/client helpers:
  - `createServerSupabase()` in `src/lib/supabase/server.ts`
  - `createClientSupabase()` in `src/lib/supabase/client.ts`
- Middleware protection for `'/dashboard/:path*'` in `src/middleware.ts`
- Roles: `admin`, `staff`, `secretary` with UI translations and guarded flows

## ⚙️ Getting Started

### 1) Clone

```bash
git clone https://github.com/dacrab/clubos-legacay.git
cd clubos-legacay
```

### 2) Install dependencies

```bash
npm install
```

### 3) Environment

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Notes:
- The app validates public Supabase envs at runtime via `src/lib/env.ts`.
- `scripts/seed.ts` expects service role access and reads `.env.local`.

### 4) Database (optional local dev)

- Requires Supabase CLI for local dev flows.
- Useful scripts from `package.json`:

```bash
npm run db:restart    # supabase stop && supabase start
npm run db:reset      # supabase db reset && bunx tsx scripts/seed.ts
```

### 5) Develop

```bash
npm run dev
# http://localhost:3000
```

## 🧪 Quality & Tooling

- **Lint & Static Analysis**:
  - Ultracite (Biome-based) with strict rules and a11y checks
  - Knip for unused code detection
- **Format**: `ultracite format .`
- **Check**: `npm run lint` runs `ultracite lint . && knip`
- **Bundle Analysis**: set `ANALYZE=true` and build to enable analyzer

Commands:

```bash
npm run dev       # Development server
npm run build     # Production build
npm start         # Start production server
npm run lint      # Lint + unused code check
npm run format    # Format codebase
```

## 🧰 Notable Features by Area

- **Sales**: add/update items, coupon discounts, treat lines, recent sales, filters
- **Inventory**: low stock card, stock updates, category management dialogs
- **Register**: open/close, closings list, detailed closing breakdown
- **Statistics**: category sales chart, top codes, date range quick selects
- **Bookings**: party and football bookings (create, list, edit, delete)

## 🖼 Images & Storage

- Remote Supabase Storage host is auto‑derived from `NEXT_PUBLIC_SUPABASE_URL`.
- Additional allowed hostnames in `next.config.ts` include a fixed Supabase demo host and `via.placeholder.com` for UI fallbacks.

## 📦 Seeding Sample Data

Seeding creates sample users, categories, products, a register session, an order with items, party appointments, and football bookings.

```bash
npm run db:reset
```

Created users:
- `admin@example.com` (admin)
- `staff@example.com` (staff)
- `secretary@example.com` (secretary)

Passwords are set in `scripts/seed.ts`.

## 📜 License

MIT © Contributors. See `LICENSE`.

## 🙌 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/) 
