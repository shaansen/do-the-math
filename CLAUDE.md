# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Do the math** - A React web app for splitting bills between two people. Users enter items manually, assign items to people, and the app calculates tax/tip splits proportionally.

Default users: Shantanu & Charlie (hardcoded in App.jsx header subtitle and as default state).

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run deploy       # Build and deploy to GitHub Pages
```

No test or lint commands are configured.

## Architecture

### Data Flow
```
VisualBillSplitter (manual entry form)
  → Price list with assignment toggles
  → Tax input (manual dollar amount)
  → Tip input (percentage or manual amount)
  → Proportional split calculation
  → Payment summary (who owes whom)
```

### Component Hierarchy
```
App.jsx (root state: billItems, subtotal, tax, total, names)
  ├── VisualBillSplitter.jsx (main business logic)
  │     └── AvatarToggle.jsx (memoized assignment buttons, DiceBear Micah avatars)
  └── ErrorBoundary.jsx (catches React errors, shows fallback UI)
```

State is managed via React hooks with props drilling (no Redux/Zustand). VisualBillSplitter calls `onItemsReady(items, subtotal, tax, total)` to push state up to App.

### Core Components

**App.jsx** - Top-level state manager. Holds all app state (`billItems`, `subtotal`, `tax`, `total`, `person1Name`, `person2Name`). Props drilled to children. Renders VisualBillSplitter directly.

**VisualBillSplitter.jsx** - Main business logic component:
- Price list with assignment toggling (cycle: both → person1 → person2 → both)
- Manual price entry form (always visible)
- Tax input (dollar amount)
- Tip calculation (percentage or manual amount toggle)
- Payment summary with "who paid" selector
- Real-time recalculation on every change via `updateTotals()`

**AvatarToggle.jsx** - Memoized (`React.memo`) avatar buttons. Uses DiceBear API with fixed seeds (Destiny for person1, Alexander for person2) for consistent avatars.

### Calculation Logic

```
// Subtotals
person1Subtotal = person1Items + (sharedItems / 2)
person2Subtotal = person2Items + (sharedItems / 2)

// Proportional tax
taxRate = taxAmount / totalSubtotal
person1Tax = person1Subtotal × taxRate
person2Tax = person2Subtotal × taxRate

// Tip (percentage mode: based on post-tax amount)
totalTip = totalWithTax × (percentage / 100)   // or manual amount
person1Tip = (person1WithTax / totalWithTax) × totalTip

// Finals
person1Total = person1Subtotal + person1Tax + person1Tip
person2Total = person2Subtotal + person2Tax + person2Tip
```

Payment summary: if person1 paid, person2 owes person2Total (and vice versa).

## Technology Stack

- **React 18.2** with hooks (useState, useEffect, useMemo, React.memo)
- **Vite 5** for build/dev server
- **DiceBear** (core + micah collection) for avatar generation
- **html2canvas** (dev dependency) for screenshot capability
- **Pure CSS** — no framework, mobile-first, gradient theme (#667eea → #764ba2)

### Styling Conventions
- Person 1 color: `#4caf50` (green)
- Person 2 color: `#f44336` (red)
- Shared color: `#ff9800` (orange)
- Mobile: touch targets ≥44px, 16px base font (prevents iOS zoom)
- Animations: CSS keyframes only

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys to GitHub Pages on push to main:
- Node 18, ubuntu-latest
- Build with `BASE_PATH='/do-the-math/'`
- Deploy via `actions/deploy-pages@v4`

Vite base path reads from `BASE_PATH` env var (defaults to `/`).

## Key Design Decisions

1. **Manual entry only** — Users enter item prices manually for simplicity and reliability
2. **Manual assignment** — Users click to toggle assignment rather than auto-parsing
3. **No state persistence** — Bill data not saved to localStorage (intentional for privacy)
4. **Proportional splits** — Tax and tip split by subtotal ratio, not 50/50
5. **Real-time updates** — Every change triggers immediate recalculation
6. **No authentication** — Fully client-side, no user accounts or backend

## Notes

- Person names default to "Shantanu" & "Charlie" in multiple places
- Avatar seeds are fixed (Destiny/Alexander) — not user-customizable
