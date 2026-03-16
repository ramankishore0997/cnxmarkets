# ECMarketsIndia Workspace

## Overview

Full-stack fintech trading platform — ECMarketsIndia.com — a premium global forex/algo trading platform with dark modern UI. Built as a pnpm monorepo with TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/ecmarkets) with Framer Motion, Recharts, react-hook-form
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs password hashing
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── ecmarkets/          # React + Vite frontend (served at /)
│   └── api-server/         # Express 5 API server (served at /api)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── ...
```

## Application Structure

### Public Website Pages (no auth)
- `/` — Home with hero, stats, features, TradingView chart, testimonials
- `/strategies` — Algo strategy cards with performance metrics (from DB)
- `/performance` — Performance analytics
- `/markets` — Forex, Gold, Indices with TradingView widgets
- `/about` — Company overview
- `/contact` — Contact form (POST /api/contact)

### Auth Pages
- `/auth/login` — JWT login
- `/auth/register` — Registration
- `/auth/forgot-password` — Password reset placeholder

### Client Dashboard (requires JWT auth)
- `/dashboard` — Balance, equity curve, recent trades/transactions
- `/dashboard/kyc` — KYC document submission
- `/dashboard/analytics` — Performance analytics with Recharts
- `/dashboard/deposit` — Deposit request form
- `/dashboard/withdraw` — Withdrawal request form
- `/dashboard/profile` — Profile & change password
- `/dashboard/notifications` — Notification center

### Admin Panel (requires admin role, access via /admin URL only)
- `/admin` — Stats dashboard
- `/admin/users` — User management; expandable rows with balance edit, assigned strategy dropdown, daily growth target %, activate/deactivate
- `/admin/kyc` — KYC review showing PAN number, Aadhar number, 4 document images (inline preview); approve/reject/delete
- `/admin/transactions` — Transaction approval; approving deposits/withdrawals auto-updates account balance
- `/admin/trades` — Manual trade injection for any user; injects trade + auto-updates account balance
- `/admin/strategies` — Strategy CRUD
- `/admin/notifications` — Send notifications to individual users or broadcast

### Client KYC page
- `/dashboard/kyc` — PAN card (number + front/back image upload), Aadhar card (number + front/back image upload), all base64 stored, validation per Indian formats (PAN: ABCDE1234F, Aadhar: 12 digits)

## Database Schema

Tables: `users`, `accounts`, `kyc_documents`, `strategies`, `transactions`, `trades`, `notifications`, `allocations`

Enums: `role` (client|admin), `kyc_status`, `risk_profile`, `transaction_type`, `transaction_status`, `direction`, `trade_status`, `notification_type`

### Notable schema fields
- `kyc_documents`: panNumber, aadharNumber, panCardFrontUrl, panCardBackUrl, aadharCardFrontUrl, aadharCardBackUrl (all text, base64 images stored in DB)
- `accounts`: assignedStrategy (text), dailyGrowthTarget (numeric)

## API Routes

All routes under `/api`:
- `/auth` — register, login, me, logout
- `/kyc` — get/submit KYC
- `/strategies` — list/get strategies (public)
- `/accounts` — dashboard, performance, allocations (auth required)
- `/transactions` — list, deposit, withdraw (auth required)
- `/trades` — list trades (auth required)
- `/notifications` — list, mark read (auth required)
- `/contact` — submit contact form (public)
- `/users` — update profile, change password (auth required)
- `/admin/*` — admin operations (admin role required)
  - PATCH `/admin/users/:id` — update role, status, balance, assignedStrategy, dailyGrowthTarget
  - DELETE `/admin/kyc/:id` — delete KYC record + reset user status to pending
  - POST `/admin/trades` — inject trade + auto-update account balance

## Demo Credentials

- **Admin**: admin@ecmarketsindia.com / password123
- **Client**: demo@ecmarketsindia.com / password123

## Auth

JWT stored as `ecm_token` in localStorage. Token sent as `Authorization: Bearer <token>`. JWT_SECRET env var (defaults to fallback for dev).

## Design System — "Terminal Stealth"

- Background: #0B0E11 (obsidian)
- Surface: #1E2329 (dark card)
- Border: #2B3139
- Gold accent: #F0B90B
- Green / profit: #02C076
- Red / loss: #CF304A
- Text: #EAECEF (primary), #848E9C (muted)
- Fonts: Inter
- Components: `.card-stealth`, `.card-stealth-gold`, `.btn-gold`, `.btn-ghost`, `.input-stealth`, `.sidebar-stealth`
- Framer Motion animated page transitions in DashboardLayout / AdminLayout
- Recharts (AreaChart, BarChart, PieChart) for data visualization
- Lucide React icons throughout
