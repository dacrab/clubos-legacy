# 🚀 Modern Custom POS System with Next.js, NeonDB, and Better Auth

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![NeonDB](https://img.shields.io/badge/NeonDB-PostgreSQL-green)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-orange)
![Better Auth](https://img.shields.io/badge/Better%20Auth-1.1.1-purple)
![Bun](https://img.shields.io/badge/Bun-1.1.38-yellow)

A comprehensive warehouse management system designed specifically for sports facility operations with role-based access control. Built with modern technologies including NeonDB, Drizzle ORM, and Better Auth for enhanced performance and developer experience.

## 📋 Table of Contents

- [About the App](#-about-this-app)
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

## 🌟 About this App:

Custom NextJS POS System is a comprehensive warehouse management system designed specifically for sports facility operations. It streamlines multiple aspects of business management through an intuitive web interface with role-based access control. The system caters to three distinct user roles:

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

Proteas provides a centralized solution for sports facility management, helping businesses streamline operations, improve customer service, and make data-driven decisions through comprehensive reporting and analytics tools. 🚀

## ✨ Features

- **🎨 Modern UI:** Clean, responsive interface built with shadcn/ui components
- **🔒 Type-safe:** End-to-end type safety with TypeScript
- **🔐 Authentication:** Secure user authentication with Supabase Auth
- **📊 Analytics:** Interactive charts and statistics with Recharts
- **🌙 Dark Mode:** Elegant dark theme support
- **🚀 SSR:** Server-side rendering for optimal performance
- **📱 Responsive:** Mobile-first responsive design
- **🤖 Automation:** Comprehensive GitHub Actions for CI/CD, security, and maintenance
- **🛡️ Security:** Automated vulnerability scanning and dependency management
- **💅 Code Quality:** Auto-formatting with Prettier and ESLint integration

## ⚙️ Tech Stack

| Category            | Technology                                    |
| ------------------- | --------------------------------------------- |
| **Framework**       | Next.js 15.2.4                                |
| **Language**        | TypeScript 5.7.2                              |
| **Database**        | NeonDB (PostgreSQL)                           |
| **ORM**             | Drizzle ORM 0.36.4                            |
| **Authentication**  | Better Auth 1.1.1                             |
| **Package Manager** | Bun 1.1.38                                    |
| **UI Library**      | React 19.0.0                                  |
| **Styling**         | Tailwind CSS 3.4.17                           |
| **UI Components**   | shadcn/ui, Radix UI                           |
| **Charts**          | Recharts 2.13.3                               |
| **Form Handling**   | React Hook Form 7.51.0                        |
| **Validation**      | Zod 3.22.4                                    |
| **Date Management** | date-fns 4.1.0                                |
| **Notifications**   | Sonner 1.7.0                                  |
| **Animation**       | Framer Motion 11.15.0                         |
| **Data Fetching**   | SWR 2.3.0                                     |
| **Code Quality**    | Enhanced ESLint with unused imports detection |

## 🔍 Prerequisites

Before you begin, ensure you have the following installed:

- **Bun:** Latest version (recommended package manager)
- **Node.js:** version 18.x or later (fallback)
- **Git:** for repository cloning
- **NeonDB Account:** To set up your PostgreSQL database

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dacrab/clubos.git
   cd clubos
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials in `.env.local`:

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

# Stack Auth (Neon Auth)

NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-client-key
STACK_SECRET_SERVER_KEY=your-secret-server-key

# App

NEXT_PUBLIC_APP_URL=http://localhost:3000

````

4. **Set up the database:**

```bash
# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate

# Seed with sample data
bun run db:seed
````

5. **Start the development server:**

   ```bash
   bun run dev
   ```

   Your application should now be running at http://localhost:3000

## 🔐 Default Login Credentials

After seeding, you can log in with:

- **Admin:** vkavouras@proton.me / password123
- **Staff:** staff@clubos.com / password123
- **Secretary:** secretary@clubos.com / password123

## 📁 Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── actions/            # Server actions
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard routes and pages
│   │   ├── history/
│   │   ├── overview/
│   │   ├── products/
│   │   ├── register-closings/
│   │   ├── statistics/
│   │   └── users/
│   ├── fonts/              # Custom fonts
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── appointments/
│   │   ├── bookings/
│   │   ├── inventory/
│   │   ├── layout/
│   │   ├── overview/
│   │   ├── products/
│   │   ├── register/
│   │   ├── sales/
│   │   ├── statistics/
│   │   └── users/
│   ├── layout/             # General layout components
│   ├── providers/          # Context providers
│   └── ui/                 # UI components from shadcn/ui
├── hooks/                  # Custom React hooks
│   ├── auth/               # Authorization hooks
│   ├── data/               # Data fetching hooks
│   ├── features/           # Hooks for specific features
│   └── utils/              # Utility hooks
├── lib/                    # Shared libraries and utilities
│   ├── supabase/           # Supabase client instances
│   ├── utils/              # Utility functions
│   └── ...                 # Other helpers and constants
├── middleware.ts           # Next.js middleware
└── types/                  # TypeScript type definitions
```

## 🔧 Development

### Commands

```bash
# Development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Code quality
bun run lint          # Lint check
bun run lint:fix      # Auto-fix lint issues
bun run format        # Format with Prettier
bun run format:check  # Check formatting
bun run type-check    # TypeScript validation

# Database commands
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
bun run db:seed      # Seed database
```

### Best Practices

- Follow TypeScript type definitions rigorously
- Utilize server components when possible
- Implement proper error boundaries
- Add loading states for async operations
- Keep components small and focused
- Follow accessibility best practices (WCAG 2.1)

### 🤖 Automated Workflows

Our GitHub Actions setup provides:

- **🚀 CI/CD Pipeline** - Automated testing, building, and deployment checks
- **🛡️ Security Scanning** - CodeQL analysis and dependency vulnerability detection
- **💅 Code Formatting** - Automated Prettier and ESLint formatting
- **📦 Dependency Management** - Smart Dependabot configuration with auto-merge
- **📊 Performance Monitoring** - Bundle size and build time tracking
- **🧹 Weekly Maintenance** - Automated health checks and reporting

For detailed information, see [`.github/README.md`](.github/README.md)

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

We welcome contributions to Custom NextJS POS! Please follow these steps:

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
