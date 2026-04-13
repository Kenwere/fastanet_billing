# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: FASTANET ISP Billing System

### Description
Full-stack multi-tenant SaaS ISP Billing & Hotspot Management System for African ISPs.

### Features
- MikroTik router management with .rsc script generation
- PPPoE/hotspot user management
- Voucher system with copy-to-clipboard
- Automated billing and payment tracking
- Payment gateway support (M-Pesa, Paystack, PesaPal, IntaSend)
- Real-time analytics with Recharts
- Multi-tenant organization settings

### Design
- White background, gold/yellow (#f5c542) primary accent
- Dark sidebar (navy #1e2d3d), gold active nav items
- Professional SaaS dashboard style
- Plus Jakarta Sans font

### Packages
- `lib/api-spec` — OpenAPI spec (openapi.yaml)
- `lib/api-zod` — Zod schemas generated from OpenAPI
- `lib/api-client-react` — React Query hooks (Orval codegen)
- `lib/db` — Drizzle ORM schema + PostgreSQL
- `artifacts/api-server` — Express 5 API server
- `artifacts/fastanet` — React + Vite frontend

### Frontend Pages
- `/` — Landing page
- `/login`, `/register` — Auth pages
- `/dashboard` — Stats + revenue chart + router health
- `/routers` — MikroTik router management + .rsc download
- `/users` — ISP subscriber management
- `/packages` — Internet package management
- `/vouchers` — Voucher generation and management
- `/pppoe` — PPPoE account management
- `/payments` — Payment tracking (M-Pesa, Paystack, etc.)
- `/sessions` — Live session monitoring + disconnect
- `/analytics` — Revenue charts, user stats, router uptime
- `/settings` — ISP organization settings

### Demo Data
- Org: SpeedLink ISP (orgId=1), subdomain=speedlink
- 2 routers (1 online, 1 offline), 4 users, 4 packages, 5 vouchers, 4 payments, 2 sessions
