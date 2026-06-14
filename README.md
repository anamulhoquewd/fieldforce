# FieldForce

A multi-tenant SaaS application for managing field teams. Managers can assign tasks to field workers, track their live GPS locations on an interactive map, and communicate with them in real time via chat.

> Work in progress — building in public over 90 days.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Module Breakdown](#module-breakdown)
  - [Server Modules](#server-modules)
  - [Client Modules](#client-modules)
- [Implementation Status](#implementation-status)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | Next.js (App Router) | 16.2.6 | React framework, SSR, routing |
| Frontend UI | Tailwind CSS v4 + shadcn/ui | 4.x | Design system & components |
| Backend | Hono | 4.12.25 | Lightweight HTTP API server |
| Backend Runtime | Node.js via `@hono/node-server` | 1.19.14 | Node adapter for Hono |
| Database | PostgreSQL (Neon serverless) | — | Primary persistent storage |
| ORM | Drizzle ORM | 0.45.2 | Type-safe DB queries & migrations |
| Cache / Pub-Sub | Redis (Upstash) via ioredis | 5.11.1 | Session caching, real-time pub/sub |
| Real-time | Socket.IO | — | Live location updates, chat (planned) |
| Maps | Google Maps JavaScript API | — | Interactive map with markers (planned) |
| File Storage | Cloudflare R2 | — | User uploads (planned) |
| Email | Gmail SMTP | — | Invitations, notifications (planned) |

---

## Project Structure

```
fieldforce/
├── client/                        # Next.js 16 frontend (App Router)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     # [STUB] Login page
│   │   │   └── signup/page.tsx    # [STUB] Signup page
│   │   ├── (dashboard)/
│   │   │   ├── chat/page.ts       # [STUB] Real-time chat page
│   │   │   ├── map/page.tsx       # [STUB] Live location map page
│   │   │   ├── tasks/page.tsx     # [STUB] Task management page
│   │   │   └── team/page.tsx      # [STUB] Team management page
│   │   ├── api/[[...route]]/
│   │   │   └── route.ts           # [STUB] API proxy to backend
│   │   ├── globals.css            # [DONE] Global styles, Tailwind v4 theme
│   │   ├── layout.tsx             # [DONE] Root layout with ThemeProvider
│   │   └── page.tsx               # [DONE] Landing/home page
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx         # [DONE] shadcn Button with CVA variants
│   │   └── theme-provider.tsx     # [DONE] Dark mode provider ('d' key toggle)
│   ├── hooks/                     # [EMPTY] Custom React hooks (future)
│   ├── lib/
│   │   └── utils.ts               # [DONE] cn() class merge utility
│   ├── .env                       # Frontend env vars (API_URL, SOCKET_URL)
│   ├── .env.example               # Env template
│   ├── components.json            # shadcn/ui config
│   ├── next.config.ts             # Next.js config (empty, uses defaults)
│   ├── postcss.config.mjs         # PostCSS with Tailwind v4 plugin
│   ├── tsconfig.json              # TypeScript config, @ alias
│   └── package.json
│
├── server/                        # Hono REST API server
│   ├── src/
│   │   ├── index.ts               # [PARTIAL] App entry, health check endpoint
│   │   ├── db/
│   │   │   ├── schema.ts          # [DONE] Drizzle schema — 8 tables
│   │   │   └── index.ts           # [STUB] DB instance exports
│   │   ├── lib/
│   │   │   ├── redis.ts           # [DONE] Redis client singleton
│   │   │   ├── redis-test.ts      # [DONE] Redis connectivity test script
│   │   │   └── auth-utils.ts      # [STUB] JWT/password utilities
│   │   ├── middleware/
│   │   │   ├── auth.ts            # [STUB] JWT auth middleware
│   │   │   └── requireRole.ts     # [STUB] Role-based access middleware
│   │   ├── routes/
│   │   │   ├── auth.ts            # [STUB] /api/v1/auth/*
│   │   │   ├── invitations.ts     # [STUB] /api/v1/invitations/*
│   │   │   ├── locations.ts       # [STUB] /api/v1/locations/*
│   │   │   ├── messages.ts        # [STUB] /api/v1/messages/*
│   │   │   └── tasks.ts           # [STUB] /api/v1/tasks/*
│   │   ├── controllers/
│   │   │   ├── index.ts           # [STUB] Controller re-exports
│   │   │   ├── auth.ts            # [STUB] Auth HTTP handlers
│   │   │   ├── invitations.ts     # [STUB] Invitation HTTP handlers
│   │   │   ├── locations.ts       # [STUB] Location HTTP handlers
│   │   │   ├── messages.ts        # [STUB] Message HTTP handlers
│   │   │   └── tasks.ts           # [STUB] Task HTTP handlers
│   │   └── services/
│   │       ├── index.ts           # [STUB] Service re-exports
│   │       ├── auth.ts            # [STUB] Auth business logic
│   │       ├── invitations.ts     # [STUB] Invitation business logic
│   │       ├── locations.ts       # [STUB] Location business logic
│   │       ├── messages.ts        # [STUB] Message business logic
│   │       └── tasks.ts           # [STUB] Task business logic
│   ├── .env                       # Server env vars (DB, Redis, API keys)
│   ├── .env.example               # Env template
│   ├── drizzle.config.ts          # Drizzle ORM + migration config
│   ├── tsconfig.json              # TypeScript config, @ alias → src/*
│   └── package.json
│
├── socket-server.ts               # [STUB] Socket.IO server (real-time)
└── README.md                      # This file
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Client (Next.js)                  │
│  Login / Signup → Dashboard → Map / Tasks / Chat   │
│                axios HTTP + Socket.IO               │
└──────────────────┬──────────────────────────────────┘
                   │ REST (port 8000)
┌──────────────────▼──────────────────────────────────┐
│              Server (Hono API)                      │
│  /api/v1/auth  /tasks  /locations  /messages  ...  │
│  Middleware: Auth (JWT) → requireRole (RBAC)        │
│  Routes → Controllers → Services → DB/Redis         │
└────────┬──────────────────┬───────────────────────── ┘
         │                  │
┌────────▼──────┐   ┌───────▼──────────────────┐
│  PostgreSQL   │   │  Redis (Upstash)          │
│  (Neon)       │   │  - Session cache          │
│  Primary data │   │  - Pub/Sub for real-time  │
└───────────────┘   └──────────────────────────┘
```

### Multi-Tenancy Model

Every resource (Task, Location, Message, Invitation) belongs to an `Organization`. A `User` can be a member of multiple organizations through the `Memberships` table. The `role` field in Memberships controls what a user can do within each organization.

```
User ──── Memberships ──── Organization
           (role: manager | employee)
```

---

## Database Schema

All tables are defined in [server/src/db/schema.ts](server/src/db/schema.ts) using Drizzle ORM.

### `users_table`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Required |
| `email` | VARCHAR(255) | Unique, required |
| `password` | VARCHAR(255) | Hashed password |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

### `organizations_table`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Organization name |
| `owner_id` | UUID | FK → users.id (org creator) |
| `created_at` | INTEGER | |
| `updated_at` | INTEGER | |

### `memberships_table`

Links users to organizations with a role. A user can be in many organizations.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id |
| `organization_id` | UUID | FK → organizations.id |
| `role` | ENUM | `"manager"` or `"employee"` |
| `joined_at` | INTEGER | |
| `created_at` | INTEGER | |
| `updated_at` | INTEGER | |

### `invitations_table`

Tracks email invitations to join an organization.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `email` | VARCHAR(255) | Invitee email |
| `token` | VARCHAR(255) | Secure random token sent via email |
| `status` | ENUM | `"pending"` / `"accepted"` / `"declined"` |
| `created_at` | INTEGER | |
| `updated_at` | INTEGER | |

### `tasks_table`

Work items that managers create and assign to employees.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `title` | VARCHAR(255) | Task title |
| `description` | VARCHAR(1000) | Detailed description (nullable) |
| `creator_id` | UUID | FK → users.id (manager) |
| `assigned_to` | UUID | FK → users.id (employee, nullable) |
| `status` | ENUM | `"pending"` / `"in_progress"` / `"completed"` |
| `latitude` | VARCHAR(255) | Task location lat (nullable) |
| `longitude` | VARCHAR(255) | Task location lng (nullable) |
| `deadline` | INTEGER | Unix timestamp (nullable) |
| `created_at` | INTEGER | |
| `updated_at` | INTEGER | |

### `locations_table`

Stores GPS snapshots for live location tracking.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id |
| `organization_id` | UUID | FK → organizations.id |
| `latitude` | VARCHAR(255) | GPS latitude |
| `longitude` | VARCHAR(255) | GPS longitude |
| `recorded_at` | INTEGER | When the GPS fix was taken |
| `created_at` | INTEGER | |
| `updated_at` | INTEGER | |

### `messages_table`

Direct messages between two users within an organization.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `sender_id` | UUID | FK → users.id |
| `receiver_id` | UUID | FK → users.id |
| `content` | VARCHAR(1000) | Message body |
| `read_at` | INTEGER | NULL until message is read |
| `created_at` | INTEGER | |
| `updated_at` | INTEGER | |

---

## API Endpoints

Base path: `/api/v1`

### Health Check
| Method | Path | Auth | Status | Description |
|---|---|---|---|---|
| GET | `/health` | None | **DONE** | Pings Redis, returns server status |

### Auth — `[STUB]`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Create new user + organization |
| POST | `/auth/login` | None | Login, returns JWT session token |
| POST | `/auth/logout` | JWT | Invalidate session |
| POST | `/auth/refresh` | JWT | Refresh access token |

### Invitations — `[STUB]`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/invitations` | JWT | manager | Send email invite to join org |
| GET | `/invitations` | JWT | manager | List all pending invitations |
| POST | `/invitations/:token/accept` | None | — | Accept invite via token link |
| POST | `/invitations/:token/decline` | None | — | Decline invite via token link |

### Tasks — `[STUB]`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/tasks` | JWT | manager | Create a new task |
| GET | `/tasks` | JWT | any | List tasks (filtered by role) |
| GET | `/tasks/:id` | JWT | any | Get single task details |
| PATCH | `/tasks/:id` | JWT | any | Update task (status, assignment) |
| DELETE | `/tasks/:id` | JWT | manager | Delete a task |

### Locations — `[STUB]`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/locations` | JWT | employee | Push current GPS coordinates |
| GET | `/locations` | JWT | manager | Get latest location for all team members |
| GET | `/locations/:userId` | JWT | manager | Get location history for one user |

### Messages — `[STUB]`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/messages` | JWT | any | Send a direct message |
| GET | `/messages/:userId` | JWT | any | Get conversation with a user |
| PATCH | `/messages/:id/read` | JWT | any | Mark message as read |

---

## Environment Variables

### Server (`server/.env`)

```env
# Server
PORT=8000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Cache (Upstash Redis)
REDIS_URL=rediss://user:pass@host:6380

# Auth
SESSION_SECRET=your-random-secret-here

# Email (Gmail SMTP for invitations)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# Google Maps (for geocoding)
GOOGLE_MAPS_API_KEY=your-key

# Cloudflare R2 (file storage)
R2_ACCESS_KEY=your-key
R2_SECRET_KEY=your-secret
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_BUCKET=fieldforce
```

### Client (`client/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)

### Install & Run

```bash
# Clone and install
git clone <repo-url>

# Server
cd server
cp .env.example .env     # fill in your values
pnpm install
pnpm dev                 # starts on http://localhost:8000

# Client (new terminal)
cd client
cp .env.example .env     # fill in your values
pnpm install
pnpm dev                 # starts on http://localhost:3000
```

### Database Migrations

```bash
cd server
pnpm drizzle-kit generate   # generate migration files
pnpm drizzle-kit migrate    # apply migrations to DB
pnpm drizzle-kit studio     # open Drizzle Studio browser UI
```

### Test Redis Connection

```bash
cd server
npx tsx src/lib/redis-test.ts
```

---

## Module Breakdown

### Server Modules

#### `src/index.ts` — App Entry Point [PARTIAL]

The root Hono application. Currently:
- Creates a Hono app with `/api/v1` base path
- Connects to Neon PostgreSQL via Drizzle
- Initializes the ioredis client
- Exposes one working endpoint: `GET /api/v1/health`
  - Sends a Redis `PING`; returns `{ status: "ok", message: "Server is healthy!" }` or `500` on failure
- Starts the HTTP server on `PORT` (default: 3000, configured: 8000)

Still needs: All route registrations (`app.route('/auth', authRoutes)` etc.)

---

#### `src/db/schema.ts` — Database Schema [DONE]

Defines all 8 Drizzle tables and their TypeScript types. Nothing else lives here. Import specific tables from this file to use in services:

```ts
import { UsersTable, TasksTable } from '@/db/schema'
```

---

#### `src/db/index.ts` — DB Instance [STUB]

Intended to export a singleton Drizzle DB instance (initialized once at startup) so all services can import `db` without re-creating connections.

---

#### `src/lib/redis.ts` — Redis Client [DONE]

Exports a single `redis` ioredis instance connected via `REDIS_URL`. Logs `✅ Redis connected` on success or `❌ Redis error` on failure. Import wherever Redis is needed:

```ts
import { redis } from '@/lib/redis'
await redis.set('key', 'value')
```

---

#### `src/lib/redis-test.ts` — Redis Test Script [DONE]

A standalone script that verifies Redis is working: PING → SET → GET → DEL → quit. Run manually to debug connection issues. Not part of the API.

---

#### `src/lib/auth-utils.ts` — Auth Utilities [STUB]

Will contain:
- `hashPassword(plain: string): Promise<string>` — bcrypt hashing
- `verifyPassword(plain, hash): Promise<boolean>` — bcrypt compare
- `signToken(payload): string` — sign JWT
- `verifyToken(token): payload` — verify + decode JWT

---

#### `src/middleware/auth.ts` — Auth Middleware [STUB]

Will be a Hono middleware that:
1. Reads the `Authorization: Bearer <token>` header
2. Verifies JWT using `auth-utils.ts`
3. Attaches `user` object to Hono context (`c.set('user', user)`)
4. Returns `401 Unauthorized` if token missing or invalid

Usage (planned):
```ts
app.use('/api/v1/tasks/*', authMiddleware)
```

---

#### `src/middleware/requireRole.ts` — RBAC Middleware [STUB]

Will be a factory middleware that checks if the authenticated user has the required role within the current organization:

```ts
app.post('/tasks', authMiddleware, requireRole('manager'), createTask)
```

Reads `user` from context (set by auth middleware), queries `MembershipsTable`, returns `403 Forbidden` if role doesn't match.

---

#### `src/routes/*.ts` — Route Definitions [STUB × 5]

Each file will create a Hono router and register handler functions from its corresponding controller. Example pattern:

```ts
// routes/tasks.ts
const tasksRoute = new Hono()
tasksRoute.post('/', authMiddleware, requireRole('manager'), createTask)
tasksRoute.get('/', authMiddleware, listTasks)
export default tasksRoute
```

Files: `auth.ts`, `invitations.ts`, `locations.ts`, `messages.ts`, `tasks.ts`

---

#### `src/controllers/*.ts` — HTTP Handlers [STUB × 5]

Controllers receive the Hono `Context` object (`c`), validate the request body, call the relevant service, and return an HTTP response. They do not contain business logic directly.

Example pattern:
```ts
// controllers/tasks.ts
export async function createTask(c: Context) {
  const body = await c.req.json()
  const task = await taskService.create(body)
  return c.json(task, 201)
}
```

Files: `auth.ts`, `invitations.ts`, `locations.ts`, `messages.ts`, `tasks.ts`

---

#### `src/services/*.ts` — Business Logic [STUB × 5]

Services contain the core application logic. They interact with the database (Drizzle) and Redis. Controllers call services; services call `db` and `redis`.

| File | Planned Functions |
|---|---|
| `auth.ts` | `register()`, `login()`, `logout()`, `refreshToken()` |
| `invitations.ts` | `sendInvite()`, `acceptInvite()`, `declineInvite()`, `listInvites()` |
| `tasks.ts` | `createTask()`, `listTasks()`, `updateTask()`, `deleteTask()`, `assignTask()` |
| `locations.ts` | `saveLocation()`, `getTeamLocations()`, `getUserHistory()` |
| `messages.ts` | `sendMessage()`, `getConversation()`, `markRead()` |

---

### Client Modules

#### `app/layout.tsx` — Root Layout [DONE]

Wraps every page with:
- Geist + Inter font variables (applied to `<html>`)
- `ThemeProvider` for dark mode support
- Tailwind CSS base styles

---

#### `app/page.tsx` — Home Page [DONE]

Landing page placeholder. Shows "Project ready!" with dark mode hint. Will become the marketing/splash page.

---

#### `app/globals.css` — Design System [DONE]

Defines the full visual design system using CSS custom properties:
- 40+ color tokens (`--background`, `--foreground`, `--primary`, `--destructive`, etc.) in OKLch color space
- Separate light and dark mode palettes
- Radius scale (`--radius-sm` through `--radius-4xl`)
- Chart colors (`--chart-1` through `--chart-5`)
- Sidebar-specific color tokens

These variables are used by shadcn/ui components throughout the app.

---

#### `app/(auth)/login/page.tsx` & `signup/page.tsx` — Auth Pages [STUB]

Will contain:
- Login: email + password form → `POST /api/v1/auth/login` → store token → redirect to dashboard
- Signup: name + email + password form → `POST /api/v1/auth/register` → create user + org → redirect

---

#### `app/(dashboard)/*` — Dashboard Pages [STUB × 4]

| Page | Planned Functionality |
|---|---|
| `tasks/page.tsx` | List/create/update tasks; managers see all tasks, employees see assigned tasks |
| `map/page.tsx` | Google Maps showing live employee locations with markers (Socket.IO updates in real-time) |
| `chat/page.ts` | Real-time direct messaging interface (Socket.IO) |
| `team/page.tsx` | Team member list, roles, invite new members via email |

---

#### `app/api/[[...route]]/route.ts` — API Proxy [STUB]

Next.js catch-all API route. Will proxy requests from the browser to the Hono backend, allowing the client to call `/api/*` without hardcoding the backend URL. Alternatively may use `NEXT_PUBLIC_API_URL` directly from the client.

---

#### `components/theme-provider.tsx` — Dark Mode [DONE]

Two components:
- `ThemeProvider` — wraps `next-themes` `NextThemesProvider`; enables system/light/dark mode
- `ThemeHotkey` — listens for the `d` key globally; toggles between `light` and `dark`; disabled when user is focused on an input or textarea

---

#### `components/ui/button.tsx` — Button Component [DONE]

Production-ready Button built with shadcn/ui + CVA:

**Variants:** `default` (primary), `outline`, `secondary`, `ghost`, `destructive`, `link`

**Sizes:** `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

**Features:** `asChild` prop for polymorphic rendering via Radix Slot, disabled/focus/active states, proper accessibility attributes.

---

#### `lib/utils.ts` — Class Utility [DONE]

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Merges Tailwind classes safely (resolves conflicts like `p-2 p-4` → keeps only `p-4`). Used by every UI component.

---

#### `socket-server.ts` — Socket.IO Server [STUB]

Root-level placeholder for the WebSocket server. Will handle:
- `location:update` — employee pushes GPS coordinates; broadcast to manager
- `message:send` — real-time chat delivery
- `task:update` — notify employee when a task is assigned/updated
- Connection authentication (verify JWT on handshake)

---

## Implementation Status

### Done

- [x] Project scaffolding (client + server directory structure)
- [x] Hono server with `GET /api/v1/health` endpoint
- [x] PostgreSQL connection via Neon + Drizzle
- [x] Redis connection via Upstash ioredis
- [x] Full database schema (8 tables, all relationships defined)
- [x] Drizzle migration config
- [x] Next.js 16 client with App Router
- [x] Tailwind CSS v4 + shadcn/ui design system
- [x] Dark mode toggle (ThemeProvider + keyboard shortcut)
- [x] Button component with variants
- [x] TypeScript configured on both client and server
- [x] Environment variable setup

### In Progress / Stub

- [ ] Auth middleware (JWT verification)
- [ ] Role-based access middleware
- [ ] Auth-utils (password hashing, token signing)
- [ ] DB singleton (`src/db/index.ts`)

### Not Started

- [ ] Auth endpoints (register, login, logout, refresh)
- [ ] Invitation system (email sending + token flow)
- [ ] Task CRUD endpoints
- [ ] Location tracking endpoints
- [ ] Messaging endpoints
- [ ] Socket.IO server (real-time location + chat)
- [ ] Login & signup pages (client)
- [ ] Dashboard pages (tasks, map, chat, team)
- [ ] Google Maps JavaScript API integration (`@googlemaps/js-api-loader`)
- [ ] API client (axios instance with auth headers)
- [ ] Custom React hooks (useAuth, useSocket, useTasks, etc.)
- [ ] File uploads (Cloudflare R2)
- [ ] Email service (Gmail SMTP for invitations)

---

## Roadmap

| Week | Feature | Status |
|---|---|---|
| 1 | Project setup (server + client + DB schema) | Done |
| 2 | Auth & multi-tenancy (register, login, JWT, orgs) | Next |
| 3 | Invitations (email invite flow, accept/decline) | Pending |
| 4 | Task management (CRUD, assignment, status) | Pending |
| 5 | Real-time location (Socket.IO, Leaflet map) | Pending |
| 6 | Real-time chat (DMs, read receipts) | Pending |
| 7 | Dashboard (stats, overview, notifications) | Pending |
| 8–13 | Polish, testing, deployment, extras | Pending |
