# ECMarket Pro — Full Platform Documentation

## Project Overview

**ECMarket Pro** (`ecmarketpro.in`) — UAE-regulated forex broker platform (Exness/XM style).
Full-stack fintech trading platform with:
- Premium public landing site (5 pages)
- Client dashboard (KYC, deposits/withdrawals, binary/crypto trading)
- Admin panel (user management, KYC approval, transactions, trade injection)

**GitHub remote**: `https://github.com/ramankishore0997/cnxmarkets.git`
Push command: `git push github master:main`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces |
| Node.js | v24 |
| Frontend | React + Vite (`artifacts/ecmarkets`) |
| API | Express 5 (`artifacts/api-server`) |
| Database | PostgreSQL + Drizzle ORM (also Supabase via SUPABASE_DATABASE_URL) |
| Auth | JWT (`ecm_token` in localStorage) + bcryptjs |
| Validation | Zod (zod/v4), drizzle-zod |
| API codegen | Orval (from OpenAPI spec) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms | react-hook-form + zodResolver |
| Charts | Recharts |
| Routing | Wouter |
| Build | esbuild (CJS) + Vite (frontend) |

---

## Design System — "ECMarket Pro Light"

### Color Palette
```
Page background:     #F5F5F5  (light grey)
Card background:     #FFFFFF
Card border:         #E5E7EB
Dark navy sidebar:   #0B1929  (primary dark)
Dark navy gradient:  linear-gradient(170deg, #0d2035, #0B1929, #091520)
Hero sections:       linear-gradient(135deg, #0B1929 0%, #0d2035 100%)
Blue primary:        #1F77B4  (buttons, links, active states)
Dark text:           #121319 / #111827
Body text:           #374151
Muted text:          #6B7280
Profit green:        #16A34A
Loss red:            #DC2626
```

### Gradient Text (Hero headings)
```css
background: linear-gradient(90deg, #1F77B4, #16A34A)
-webkit-background-clip: text; -webkit-text-fill-color: transparent;
```

### Ticker bar background: `#060e1a`

### Typography
- Font: `Inter` (all weights 300–900)
- Monospace: `JetBrains Mono` (for PAN/Aadhaar fields, trade data)

### CSS Utility Classes (in `artifacts/ecmarkets/src/index.css`)
```
.btn-gold / .btn-green   — Blue gradient button with hover lift
.btn-ghost               — Outline button
.card-stealth            — White card with hover border-blue + lift
.input-stealth           — Form input with focus ring
.sidebar-stealth         — Dark navy sidebar gradient
.nav-item-active         — White left border + bg highlight (sidebar)
.nav-item-hover          — Hover slide right effect
.glass-tile              — Light grey info tile
.live-dot                — Green pulsing dot animation
```

### Global Button Effects (applied via CSS — ALL buttons site-wide)
- Hover: `filter: brightness(1.10) saturate(1.05)` — glow lift
- Active/Press: `transform: scale(0.95) translateY(1px)` — push down feel
- Disabled: `opacity: 0.55`, no effects
- Add class `no-hover` to opt-out on any anchor

---

## Monorepo Structure

```
workspace/
├── artifacts/
│   ├── ecmarkets/              # React + Vite frontend (port via $PORT)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── public/     # Home, Markets, About, FAQ, Contact
│   │   │   │   ├── auth/       # Login, Register
│   │   │   │   ├── client/     # Dashboard pages (auth required)
│   │   │   │   └── admin/      # Admin pages (admin role)
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── PublicLayout.tsx   # Pill navbar + ticker + footer
│   │   │   │   │   ├── DashboardLayout.tsx # Floating dark sidebar
│   │   │   │   │   └── AdminLayout.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── EcmLogo.tsx        # Logo components
│   │   │   │       ├── TradingWidget.tsx  # Live price ticker + chart widget
│   │   │   │       └── LivePriceTicker.tsx
│   │   │   └── index.css                  # Global design tokens + utilities
│   └── api-server/             # Express 5 API (port 8080 dev)
│       └── src/server.ts
├── lib/
│   ├── api-spec/               # OpenAPI spec
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Drizzle schema + DB connection
└── pnpm-workspace.yaml
```

---

## Logo & Branding

**Components in** `artifacts/ecmarkets/src/components/shared/EcmLogo.tsx`:
- `NavbarLogo` — inline horizontal (for navbars). Use `theme="light"` on light bg, `theme="dark"` on dark bg
- `BrandLogo` — stacked with tagline (for footer, login pages)
- `EcmLogo` — icon only (just the bar chart square)
- **Tagline**: "Forex · Crypto · CFDs"
- **Favicon**: `artifacts/ecmarkets/public/favicon.svg` (dark navy square + rising bars)
- **Manifest**: "ECMarket Pro" brand name

---

## Public Website (PublicLayout)

**Layout**: `PublicLayout.tsx`
- Top: Custom marquee live price ticker (dark `#060e1a` bg, 12 pairs scrolling)
- Sticky pill navbar: `#f6f6f6` bg, border-radius 9999, logo left + nav center + CTA buttons right
- Footer: Dark navy `#0B1929`, 5-column grid, email: `support@ecmarketsindia.com`

**Pages:**

### `/` — Home (`Home.tsx`)
Sections: Hero (dark navy) → Dashboard Mockup (SVG chart + positions table) → Feature Cards (6) → Account Pricing (Standard/Pro/Elite) → Trading Platforms (WebTrader/MT4/MT5/App) → Deposit/Withdrawal Steps → Contact Form

### `/markets` — Markets (`Markets.tsx`)
Dark navy hero + gradient text, live price ticker with real-time updates, tabbed instrument table (Forex/Crypto/Commodities/Indices), "Trade" button per row, feature cards, dark CTA

### `/about` — About (`About.tsx`)
Dark hero + stats grid (10 Lakh+, 7+ years, 200+, 50 countries), Core Values cards, milestone timeline, Regulatory & Security section
**REMOVED**: Leadership Team section

### `/faq` — FAQ (`Faq.tsx`)
Searchable accordion with category filters, 18 Q&A entries

### `/contact` — Contact (`Contact.tsx`)
**ONLY EMAIL** support — no WhatsApp, no phone, no live chat
Email: `support@ecmarketpro.in`
Contact form fields: Name, Email, Subject, Message (phone field removed)

---

## Live Price Ticker (`TradingWidget.tsx`)

Custom CSS marquee — NOT TradingView widget.
- 12 pairs: EUR/USD, GBP/USD, USD/JPY, AUD/USD, EUR/GBP, USD/CAD, USD/CHF, XAU/USD, BTC/USD, ETH/USD, SOL/USD, XRP/USD
- Updates every 1.4s (simulated)
- Flash effect: green = price up, red = price down
- "LIVE" badge with pulsing green dot on left
- Fade edges gradient
- Hover pauses scroll

---

## Dashboard Layout (`DashboardLayout.tsx`)

- Sidebar: floating, 12px gap from edges, `border-radius: 20px`, dark navy gradient
- No bottom navigation bar (removed)
- Sidebar collapses on mobile

---

## Client Dashboard Pages

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `Dashboard.tsx` | Balance, equity, recent trades |
| `/dashboard/binary` | `BinaryTrading.tsx` | Up/Down binary options |
| `/dashboard/crypto` | (crypto trading) | Crypto trading terminal |
| `/dashboard/analytics` | `Analytics.tsx` | Equity curve, win/loss donut, P&L |
| `/dashboard/trades` | `TradeHistory.tsx` | Trade history table |
| `/dashboard/deposit` | `Deposit.tsx` | Deposit (UPI/Bank/Crypto) |
| `/dashboard/withdraw` | `Withdraw.tsx` | Withdrawal form |
| `/dashboard/kyc` | `Kyc.tsx` | **Modernized** KYC with dark hero, step bar |
| `/dashboard/profile` | `Profile.tsx` | Profile + password change |
| `/dashboard/notifications` | `Notifications.tsx` | Notification center |

### KYC Page — `Kyc.tsx` (modernized)
- Dark navy header card with shield icon + status badge + trust row
- 3-step progress bar: Personal Details → Upload Documents → Verification
- Two form sections (Personal Details, Document Photos) as separate white cards
- Document upload progress bar (0→4 files)
- Divider labels for Aadhaar / PAN sections
- Status states: Verified (green), Under Review (blue), Rejected (red banner), Pending form
- Checklist shown when form incomplete

---

## Admin Panel

| Route | Description |
|-------|-------------|
| `/admin` | Stats dashboard |
| `/admin/users` | User list, balance edit, strategy assign |
| `/admin/kyc` | KYC review, approve/reject, document image preview |
| `/admin/transactions` | Deposit/withdrawal approval (auto-updates balance) |
| `/admin/trades` | Manual trade injection |
| `/admin/strategies` | Strategy CRUD |
| `/admin/notifications` | Broadcast notifications |

**Admin credentials**: `admin@ecmarketsindia.com` / `Admin@1234`

---

## Auth System

- JWT stored as `ecm_token` in localStorage
- Auth header: `Authorization: Bearer <token>`
- JWT_SECRET env var (has dev fallback)
- `getToken()` helper: `localStorage.getItem('ecm_token') || ''`
- `getAuthOptions()` from `@/lib/api-utils`

**Demo client credentials**: `demo@ecmarketsindia.com` / `password123`

---

## Database

### Tables
`users`, `accounts`, `kyc_documents`, `strategies`, `transactions`, `trades`, `notifications`, `allocations`

### Key Schema Notes
- `kyc_documents`: panNumber, aadharNumber, panCardFrontUrl, panCardBackUrl, aadharCardFrontUrl, aadharCardBackUrl (base64 images in DB)
- `accounts`: assignedStrategy (text), dailyGrowthTarget (numeric), balance
- `users`: role enum (client|admin), kycStatus

### Connections
- Local PostgreSQL: `DATABASE_URL` env var
- Supabase: `SUPABASE_DATABASE_URL` + `SUPABASE_SERVICE_KEY` env vars

---

## API Routes (all under `/api`)

```
POST /api/auth/register     — Register new user
POST /api/auth/login        — Login, returns JWT
GET  /api/auth/me           — Get current user
POST /api/auth/logout       — Logout

GET  /api/kyc               — Get user's KYC status
POST /api/kyc               — Submit KYC (multipart/form-data with images)

GET  /api/accounts/dashboard     — Balance, equity, stats
GET  /api/accounts/performance   — Equity curve data
GET  /api/transactions           — Transaction history
POST /api/transactions/deposit   — Deposit request
POST /api/transactions/withdraw  — Withdrawal request

GET  /api/trades                 — Trade history
GET  /api/notifications          — Notification list
PATCH /api/notifications/:id     — Mark as read

GET  /api/strategies             — List all strategies

PATCH /api/users/profile         — Update profile
PATCH /api/users/password        — Change password

// Admin (admin role required)
GET/PATCH /api/admin/users/:id
DELETE /api/admin/kyc/:id
POST /api/admin/trades           — Inject trade
GET/PATCH /api/admin/transactions/:id
```

---

## Environment Secrets

| Secret | Used for |
|--------|---------|
| `SUPABASE_DATABASE_URL` | Supabase PostgreSQL connection |
| `SUPABASE_SERVICE_KEY` | Supabase admin operations |
| `TELEGRAM_BOT_TOKEN` | Telegram notifications |
| `TELEGRAM_CHAT_ID` | Telegram chat target |

---

## Important Rules & Constraints

1. **NO python3** — only Node.js/TypeScript
2. **NO new npm packages** without explicit request — use existing deps
3. **Routing**: Wouter (not React Router) — `useLocation`, `Link`, `useRoute`
4. **API base**: `/api` (not `http://localhost:8080`)
5. **Ports**: Frontend reads `$PORT` env var (Vite config); API server port 8080 dev
6. **Build command**: `pnpm --filter @workspace/api-server run build` then restart workflow
7. **Never change primary key ID column types** (serial ↔ varchar breaks DB)
8. **Push to GitHub**: `git push github master:main` from `/home/runner/workspace`

---

## Things REMOVED from Site (do NOT add back)

- ❌ WhatsApp support (removed from Contact page, Home page)
- ❌ Phone/telephone support numbers (removed everywhere)
- ❌ Live Chat option (removed from Contact page)
- ❌ Leadership Team section (removed from About page)
- ❌ Telegram channel link (removed from Contact page)
- ❌ Bottom navigation bar in dashboard (removed)
- ❌ TradingView ticker tape widget (replaced with custom marquee)

---

## Contact Info on Site

- **Email only**: `support@ecmarketpro.in`
- **Headquarters**: Dubai International Financial Centre, Dubai, UAE

---

## Build Status

Last confirmed build: ✅ 2871 modules transformed, zero errors
