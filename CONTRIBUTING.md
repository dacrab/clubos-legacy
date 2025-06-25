# 🤝 Contributing to Proteas

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Thank you for your interest in contributing to Proteas! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Coding Guidelines](#-coding-guidelines)
- [Git Workflow](#-git-workflow)
- [Pull Request Process](#-pull-request-process)
- [Testing Guidelines](#-testing-guidelines)
- [Questions and Support](#-questions-and-support)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive of all contributors
- Provide constructive feedback
- Focus on the best outcomes for the project
- Be open to different viewpoints and experiences

## 🔧 Development Setup

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/dacrab/proteas-site-demo.git
   cd proteas-site-demo
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env.local` file with your Supabase credentials:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Access the application:**

   The app should now be running at http://localhost:3000

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

## 💻 Coding Guidelines

### TypeScript Guidelines

- Use TypeScript for all new code
- Prefer interfaces over types when defining objects
- Avoid using `any` - use proper type definitions
- Use explicit return types for functions
- Use type imports/exports appropriately
- Follow existing type patterns in the codebase

### Component Guidelines

- Use shadcn/ui components when possible
- Follow React Server Components patterns where appropriate
- Implement proper loading states for async operations
- Add appropriate error handling and error boundaries
- Keep components small and focused
- Use proper TypeScript interfaces for props
- Follow accessibility best practices (WCAG 2.1)

### Styling Guidelines

- Use Tailwind CSS for styling
- Follow the established design system
- Maintain responsive design across all screen sizes
- Ensure dark mode support for all components

## 🔀 Git Workflow

### Branching Strategy

- `main` - production-ready code
- `develop` - integration branch for features
- `feature/xyz` - individual feature branches
- `fix/xyz` - bug fix branches

### Commit Message Format

Follow this format for commit messages:

- **fix:** for bug fixes (e.g., "fix: resolve authentication timeout issue")
- **feat:** for new features (e.g., "feat: add sales filtering by date range")
- **perf:** for performance improvements (e.g., "perf: optimize dashboard queries")
- **docs:** for documentation changes (e.g., "docs: update installation instructions")
- **style:** for formatting changes (e.g., "style: format code according to styleguide")
- **refactor:** for code refactoring (e.g., "refactor: extract sales logic to custom hook")
- **test:** for adding missing tests (e.g., "test: add unit tests for sales calculations")
- **chore:** for maintenance tasks (e.g., "chore: update dependencies")

## 🔄 Pull Request Process

1. **Create a new branch from develop:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes following the code style guidelines**

3. **Commit your changes with descriptive messages:**

   ```bash
   git commit -m "feat: add new filtering option for sales dashboard"
   ```

4. **Push your branch to your fork:**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request with the following information:**
   - Clear description of the changes
   - Screenshot(s) for UI changes
   - How to test the changes
   - Related issue(s) if applicable

6. **Address any feedback from reviewers**

7. **Once approved, your PR will be merged**

## 🧪 Testing Guidelines

- Write unit tests for utilities and custom hooks
- Test components for proper rendering and functionality
- Verify changes across different browsers
- Test responsiveness on various screen sizes
- Ensure all features work in both light and dark modes
- Verify error handling and edge cases

## ❓ Questions and Support

If you have questions or encounter any problems:

1. Check existing issues to see if your question has been addressed
2. Open a new issue with the "question" label for general inquiries
3. Reach out to maintainers for urgent matters

---

By contributing to Proteas, you agree that your contributions will be licensed under the MIT License.
