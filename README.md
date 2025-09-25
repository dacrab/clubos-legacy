# 🚀 clubOS - Modern Next.js Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.47.10-green)

A comprehensive warehouse management system designed specifically for sports facility operations with role-based access control.

## 📋 Table of Contents

- [About the App](#-about-clubOS-app)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [UI Components](#-ui-components)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🌟 About clubOS App

clubOS is a comprehensive warehouse management system designed specifically for sports facility operations. It streamlines multiple aspects of business management through an intuitive web interface with role-based access control. The system caters to three distinct user roles:

### 👨‍💼 Admin Features
- **💰 Sales Management:** Track and manage all sales transactions with detailed product information
- **📦 Inventory Control:** Monitor stock levels with automatic low-stock alerts and inventory management
- **🏦 Register Closings:** Record and view daily register closings with detailed financial reporting
- **👥 User Management:** Create and manage staff and secretary accounts with appropriate permissions
- **📊 Statistics Dashboard:** Access detailed analytics including sales trends, revenue reports, and top-selling products
- **🎉 Children's Party Bookings:** Manage reservations for children's birthday parties with full customer details
- **⚽ 5x5 Football Field Bookings:** Handle scheduling for football field rentals with comprehensive booking details
- **🗂️ Category Management:** Create and organize hierarchical product categories with parent-child relationships
- **📈 Sales History:** Access detailed historical sales data with advanced date and time filtering

### 👩‍💼 Secretary Features
- **🎉 Children's Party Management:** Create, view, and manage upcoming children's birthday party bookings
- **⚽ Football Field Reservations:** Schedule and track football field bookings
- **📞 Customer Management:** Maintain contact information and booking details for clients

### 👨‍💼 Staff Features
- **🛒 Point of Sale System:** Process sales transactions for products and services
- **ℹ️ Basic Inventory Access:** View product availability and stock information
- **🧾 Daily Sales Reporting:** Access reports for sales processed through their account

### ✨ Core Functionality
- **🎭 Multi-role Support:** Tailored interfaces and permissions for administrators, secretaries, and staff
- **🔄 Real-time Inventory Tracking:** Automatic updates to stock levels when sales are processed
- **📅 Reservation System:** Comprehensive booking management for facilities and services
- **📈 Financial Reporting:** Detailed sales analytics and register closing summaries
- **💻 User-friendly Interface:** Intuitive dashboard with role-specific views and responsive design
- **🌙 Dark Mode Support:** Comfortable viewing option for different lighting conditions
- **💳 Multiple Payment Methods:** Support for cash, card, and complimentary transactions
- **🔍 Data Filtering:** Advanced filtering capabilities across sales, bookings, and reporting

clubOS provides a centralized solution for sports facility management, helping businesses streamline operations, improve customer service, and make data-driven decisions through comprehensive reporting and analytics tools. 🚀

## ✨ Features

- **🎨 Modern UI:** Clean, responsive interface built with shadcn/ui components
- **🔒 Type-safe:** End-to-end type safety with TypeScript
- **🔐 Authentication:** Secure user authentication with Supabase Auth
- **📊 Analytics:** Interactive charts and statistics with Recharts
- **🌙 Dark Mode:** Elegant dark theme support
- **🚀 SSR:** Server-side rendering for optimal performance
- **📱 Responsive:** Mobile-first responsive design
- **⚡ Real-time:** Live updates through Supabase real-time subscriptions

## ⚙️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.2.4 |
| **Language** | TypeScript 5.7.2 |
| **Database** | Supabase 2.47.10 |
| **UI Library** | React 19.0.0 |
| **Styling** | Tailwind CSS 3.4.17 |
| **UI Components** | shadcn/ui, Radix UI |
| **Charts** | Recharts 2.13.3 |
| **Form Handling** | React Hook Form 7.51.0 |
| **Validation** | Zod 3.22.4 |
| **Date Management** | date-fns 4.1.0 |
| **Notifications** | Sonner 1.7.0 |
| **Animation** | Framer Motion 11.15.0 |
| **Data Fetching** | SWR 2.3.0 |

## 🔍 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** version 18.x or later
- **npm:** version 9.x or later (or yarn)
- **Git:** for repository cloning
- **Supabase Account:** To set up your own backend

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dacrab/clubOS.git
   cd clubOS
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   Your application should now be running at http://localhost:3000

## 📁 Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard routes
│   │   ├── codes/        # Product code management
│   │   ├── history/      # Sales history tracking
│   │   ├── overview/     # Dashboard overview
│   │   ├── register-closings/ # Register closing records
│   │   ├── statistics/   # Sales analytics and statistics
│   │   └── users/        # User management
│   ├── loading/          # Loading state components
│   └── fonts/            # Custom fonts
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── codes/       # Product code management components
│   │   ├── inventory/   # Inventory management components
│   │   ├── register/    # Register management components
│   │   ├── sales/       # Sales-related components
│   │   ├── statistics/  # Statistics visualization components
│   │   └── users/       # User management components
│   ├── layout/          # Layout components
│   ├── providers/       # Context providers
│   └── ui/              # UI components
├── hooks/                # Custom React hooks
│   ├── usePolling.ts    # Data polling hook
│   ├── useSales.ts      # Sales management hook
│   └── useSaleActions.ts # Sale action handlers
├── lib/                  # Shared libraries and utilities
│   ├── utils/           # Utility functions
│   ├── constants.ts     # Application constants
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
├── types/                # TypeScript types
│   ├── supabase.ts      # Supabase database types
│   ├── sales.ts         # Sales-related types
│   ├── register.ts      # Register-related types
│   └── appointments.ts  # Appointment types
└── middleware.ts        # Next.js middleware
```

## 🔧 Development

### Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint Check
npm run lint
```

### Best Practices

- Follow TypeScript type definitions rigorously
- Utilize server components when possible
- Implement proper error boundaries
- Add loading states for async operations
- Keep components small and focused
- Follow accessibility best practices (WCAG 2.1)

## 🎨 UI Components

We use shadcn/ui as our primary component library, with Radix UI as a fallback for advanced components. All components follow our design system and maintain consistency across the application.

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Deploy!

## 📚 Documentation

For detailed documentation about:

- Component usage
- API endpoints
- Database schema
- Authentication flow

Refer to the inline code comments and type definitions in the codebase.

## 🤝 Contributing

We welcome contributions to clubOS! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [contribution guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.io/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI primitives
