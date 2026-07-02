Cloud-based Freight Management SaaS for freight forwarders, NVOCCs, and 3PL providers.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Components | shadcn/ui + Radix UI |
| Icons | Lucide React |
| Docs | Storybook |

## Modules

- Auth & RBAC
- Customer Management
- Quotations
- Air Export
- Sea FCL Export
- Sea FCL Import
- Documentation (HAWB, MAWB, HBL, MBL)
- Finance & Accounts
- NVOCC
- HR & Leave Management
- Reports & MIS

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/FizaTariq147/KingFisher Tech-gold-frontend.git
cd KingFisher Tech-gold-frontend
npm install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
```

### Running the App

```bash
# Development server
npm run dev

# Storybook component docs
npm run storybook

# Production build
npm run build
```

## Project Structure
src/

├── assets/           # Logos, images, icons

├── components/

│   ├── ui/           # Base components: Button, Input, Badge, Card, Table, Modal

│   └── layout/       # AppShell, Sidebar, Topbar, NavShell

├── features/         # One folder per ERP module

│   ├── auth/

│   ├── customers/

│   ├── quotations/

│   ├── jobs/

│   ├── documentation/

│   ├── finance/

│   ├── nvocc/

│   └── hr/

├── hooks/            # Shared custom hooks

├── lib/              # axios, queryClient, utils

├── pages/            # Route-level page components

├── router/           # React Router v6 config

├── store/            # Zustand stores (auth, ui)

├── types/            # Shared TypeScript interfaces

└── styles/           # Global CSS + theme tokens

## Theming

Three themes are supported via CSS variables:

| Theme | Class | Primary Color |
|---|---|---|
| Forest Green (default) | — | #22C55E |
| Ocean Blue | theme-blue | #3B82F6 |
| Crimson Red | theme-red | #F43F5E |

Switch themes by adding the class to `<html>`:

```ts
document.documentElement.classList.add('theme-blue');
```

## Branching Strategy
main          — production releases only

develop       — integration branch

feature/*     — one branch per feature/module

hotfix/*      — urgent production fixes

## Team

| Role | Responsibility |
|---|---|
| Dev 1 | Backend (NestJS), Database (PostgreSQL), DevOps |
| Dev 2 | Frontend (React), QA, Component Library |
