# FieldForce

A multi-tenant SaaS application for managing field teams. Managers can assign tasks to field workers, track their live GPS locations on an interactive map, and communicate with them in real time via chat.

> Work in progress — building in public over 90 days.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Auth Strategy](#auth-strategy)
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
| Cache / Session | Redis (Upstash) via ioredis | 5.11.1 | Session store, real-time pub/sub |
| Password Hashing | bcrypt | — | Secure password hashing |
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
│   │   ├── index.ts               # [DONE] App entry — health check + auth + invitation routes
│   │   ├── db/
│   │   │   ├── schema.ts          # [DONE] Drizzle schema — 7 tables + 2 pgEnums
│   │   │   └── index.ts           # [DONE] PostgreSQL pool + Drizzle db instance
│   │   ├── lib/
│   │   │   ├── redis.ts           # [DONE] Redis client singleton
│   │   │   ├── auth.ts            # [DONE] bcrypt hash, compare, token generator
│   │   │   └── session.ts         # [DONE] Redis session create / get / delete
│   │   ├── middleware/
│   │   │   ├── auth.ts            # [DONE] authMiddileware + requiredRoles (RBAC)
│   │   │   └── requireRole.ts     # [STUB] (superseded by requiredRoles in auth.ts)
│   │   ├── routes/
│   │   │   ├── auth.ts            # [DONE] /api/v1/auth/* (signup, signin, signout, me)
│   │   │   ├── invitations.ts     # [DONE] /api/v1/invitations/* (register, list, accept)
│   │   │   ├── locations.ts       # [STUB] /api/v1/locations/*
│   │   │   ├── messages.ts        # [STUB] /api/v1/messages/*
│   │   │   └── tasks.ts           # [STUB] /api/v1/tasks/*
│   │   ├── controllers/
│   │   │   ├── index.ts           # [DONE] Controller re-exports (auth, invitation)
│   │   │   ├── auth.ts            # [DONE] signup / signin / signout handlers
│   │   │   ├── invitations.ts     # [DONE] create / list / accept invitation handlers
│   │   │   ├── locations.ts       # [STUB] Location HTTP handlers
│   │   │   ├── messages.ts        # [STUB] Message HTTP handlers
│   │   │   └── tasks.ts           # [STUB] Task HTTP handlers
│   │   └── services/
│   │       ├── index.ts           # [DONE] Service re-exports (auth, invitations)
│   │       ├── auth.ts            # [DONE] signupService, singinService
│   │       ├── invitations.ts     # [DONE] createInvitationService, acceptInvitationService
│   │       ├── locations.ts       # [STUB] Location business logic
│   │       ├── messages.ts        # [STUB] Message business logic
│   │       └── tasks.ts           # [STUB] Task business logic
│   ├── types/
│   │   └── index.ts               # [DONE] Shared TypeScript types (IRoles)
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
│       axios HTTP (cookie-based) + Socket.IO         │
└──────────────────┬──────────────────────────────────┘
                   │ REST (port 8000)
┌──────────────────▼──────────────────────────────────┐
│              Server (Hono API)                      │
│  /api/v1/auth  /tasks  /locations  /messages  ...  │
│  Middleware: authMiddleware → requireRole (RBAC)    │
│  Routes → Controllers → Services → DB / Redis       │
└────────┬──────────────────┬─────────────────────────┘
         │                  │
┌────────▼──────┐   ┌───────▼──────────────────────────┐
│  PostgreSQL   │   │  Redis (Upstash)                  │
│  (Neon)       │   │  session:{id} → { userId, orgId,  │
│  Primary data │   │    role }  TTL: 7 days            │
└───────────────┘   └──────────────────────────────────┘
```

### Multi-Tenancy Model

Every resource (Task, Location, Message, Invitation) belongs to an `Organization`. A `User` can be a member of multiple organizations through the `Memberships` table. The `role` field controls what a user can do within each organization.

```
User ──── Memberships ──── Organization
           (role: manager | worker)
```

---

## Auth Strategy

FieldForce uses **Redis-backed session authentication** (not JWT tokens).

### How it works

```
[POST /auth/signup or /auth/signin]
        │
        ▼
  Validate input → hash password (bcrypt) → query DB
        │
        ▼
  Create session in Redis:
    Key:   session:{randomHex64}
    Value: { userId, organizationId, role }
    TTL:   7 days
        │
        ▼
  Set signed HTTP-only cookie:
    Name:     session
    Value:    sessionId (signed with SESSION_SECRET)
    maxAge:   7 days
    httpOnly: true
    sameSite: Lax
    secure:   true (production only)
        │
        ▼
  Return user + org info as JSON
```

### Protected routes

```
Request with cookie → authMiddleware
        │
        ▼
  getSignedCookie(c, SESSION_SECRET, "session")
        │
        ▼
  redis.get("session:{sessionId}") → parse SessionData
        │
  null? → 401 Unauthorized
        │
  found? → c.set("user", session) → next()
```

### Signout

```
[POST /auth/signout]
  redis.del("session:{sessionId}")  ← invalidate server-side
  deleteCookie(c, "session")        ← clear client cookie
```

---

## Database Schema

All tables defined in [server/src/db/schema.ts](server/src/db/schema.ts). The DB instance is created in [server/src/db/index.ts](server/src/db/index.ts) using a `pg.Pool` and passed to Drizzle with the full schema for relational queries.

**Drizzle pgEnums defined in schema:**
- `roleEnum` — `"manager" | "worker"` — used in `memberships.role` and `invitations.role`
- `invitationStatuses` — `"pending" | "accepted" | "declined"` — used in `invitations.status`

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Required |
| `email` | VARCHAR(255) | Unique, required |
| `password` | VARCHAR(255) | bcrypt hashed, required |
| `created_at` | TIMESTAMP | Auto set on insert |
| `updated_at` | TIMESTAMP | Auto set on insert |

### `organizations`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Organization name |
| `owner_id` | UUID | FK → users.id (creator / first manager) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `memberships`

Links users to organizations with a role. A user can belong to multiple orgs.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id |
| `organization_id` | UUID | FK → organizations.id |
| `role` | ENUM (`roleEnum`) | `"manager"` or `"worker"` |
| `joined_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `invitations`

Tracks email invitations to join an organization.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `email` | VARCHAR(255) | Invitee email address |
| `token` | VARCHAR(255) | Secure random hex token (sent via email link) |
| `role` | ENUM (`roleEnum`) | Role the invitee will receive: `"manager"` / `"worker"` |
| `status` | ENUM (`invitationStatuses`) | `"pending"` (default) / `"accepted"` / `"declined"` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `tasks`

Work items created by managers and assigned to field workers.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `title` | VARCHAR(255) | Task title |
| `description` | VARCHAR(1000) | Detailed description |
| `creator_id` | UUID | FK → users.id (manager who created it) |
| `assigned_to` | UUID | FK → users.id (worker, nullable) |
| `status` | VARCHAR(50) | `"pending"` / `"in_progress"` / `"completed"` |
| `latitude` | INTEGER | Task site location (nullable) |
| `longitude` | INTEGER | Task site location (nullable) |
| `deadline` | INTEGER | Unix timestamp deadline (nullable) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `locations`

Stores GPS snapshots for live location tracking of field workers.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id |
| `organization_id` | UUID | FK → organizations.id |
| `latitude` | INTEGER | GPS latitude |
| `longitude` | INTEGER | GPS longitude |
| `recorded_at` | TIMESTAMP | When the GPS fix was captured |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `messages`

Direct messages between two users within an organization.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `sender_id` | UUID | FK → users.id |
| `receiver_id` | UUID | FK → users.id |
| `content` | VARCHAR(1000) | Message body |
| `read_at` | TIMESTAMP | NULL until the receiver reads it |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## API Endpoints

Base path: `/api/v1`

### Health Check

| Method | Path | Auth | Status | Description |
|---|---|---|---|---|
| GET | `/health` | None | **DONE** | Returns `"Server is healthy!"` |

### Auth

| Method | Path | Auth | Status | Description |
|---|---|---|---|---|
| POST | `/auth/signup` | None | **DONE** | Register user + create org + set session cookie |
| POST | `/auth/signin` | None | **DONE** | Login + set session cookie |
| POST | `/auth/signout` | Cookie | **DONE** | Delete Redis session + clear cookie |
| GET | `/auth/me` | Cookie | **DONE** | Return current user from session |

**Signup request body:**
```json
{
  "name": "Anamul Hoque",
  "email": "user@example.com",
  "password": "secret123",
  "organizationName": "My Company"
}
```

**Signup / Signin response:**
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "sessionId": "...",
    "user": { "id": "uuid", "name": "...", "email": "..." },
    "organization": { "id": "uuid", "name": "..." }
  }
}
```

### Invitations

| Method | Path | Auth | Role | Status | Description |
|---|---|---|---|---|---|
| POST | `/invitations/register` | Cookie | manager | **DONE** | Create invitation record + return invite link |
| GET | `/invitations/list` | Cookie | manager | **DONE** | List all invitations for the org |
| POST | `/invitations/accept` | None | — | **DONE** | Accept invite — creates user account + sets session |
| POST | `/invitations/decline` | None | — | STUB | Decline an invitation via token |

**`POST /invitations/register` request body:**
```json
{ "email": "worker@example.com", "role": "worker" }
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation created",
  "data": {
    "invitation": { ... },
    "inviteLink": "http://localhost:3000/join?token=abc123..."
  }
}
```

**`POST /invitations/accept` request body:**
```json
{ "token": "abc123...", "name": "Field Worker", "password": "secret123" }
```

### Tasks — `[STUB]`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/tasks` | Cookie | manager | Create a new task |
| GET | `/tasks` | Cookie | any | List tasks (filtered by role) |
| GET | `/tasks/:id` | Cookie | any | Get single task details |
| PATCH | `/tasks/:id` | Cookie | any | Update task (status, assignment) |
| DELETE | `/tasks/:id` | Cookie | manager | Delete a task |

### Locations — `[STUB]`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/locations` | Cookie | worker | Push current GPS coordinates |
| GET | `/locations` | Cookie | manager | Get latest location for all team members |
| GET | `/locations/:userId` | Cookie | manager | Get location history for one user |

### Messages — `[STUB]`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/messages` | Cookie | any | Send a direct message |
| GET | `/messages/:userId` | Cookie | any | Get conversation with a user |
| PATCH | `/messages/:id/read` | Cookie | any | Mark message as read |

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

# Auth — used to sign session cookies (keep secret, use a long random string)
SESSION_SECRET=your-random-secret-here

# Email (Gmail SMTP for invitations)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password

# Google Maps (for geocoding / map features)
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
pnpm drizzle-kit generate   # generate SQL migration files
pnpm drizzle-kit migrate    # apply migrations to Neon DB
pnpm drizzle-kit studio     # open Drizzle Studio in browser
```

---

## Module Breakdown

### Server Modules

---

#### `src/index.ts` — App Entry Point [DONE]

Root Hono application. Sets up the server and mounts all routes.

- Creates Hono app with `/api/v1` base path
- Registers `GET /health` — returns `"Server is healthy!"`
- Registers auth routes: `app.route("/auth", authRoute)`
- Starts HTTP server on `PORT` (default 3000, configured 8000)

---

#### `src/db/index.ts` — DB Instance [DONE]

Creates and exports the single `db` instance used across all services.

```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
```

Throws on startup if `DATABASE_URL` is missing. All services import `db` from here.

---

#### `src/db/schema.ts` — Database Schema [DONE]

Defines all 7 Drizzle table definitions and their TypeScript types. Import specific tables in services:

```ts
import { users, tasks, memberships } from '@/db/schema.js'
```

---

#### `src/lib/redis.ts` — Redis Client [DONE]

Exports a single `redis` ioredis instance. Logs connection status on startup.

```ts
import { redis } from '@/lib/redis.js'
await redis.set('key', 'value', 'EX', 3600)
```

---

#### `src/lib/auth.ts` — Auth Utilities [DONE]

Three exported functions for password and token operations:

| Function | Signature | Description |
|---|---|---|
| `passwordHashingHelper` | `(password: string) → Promise<string>` | Hashes with bcrypt (10 salt rounds). Throws if input is empty or not a string. |
| `comparePassword` | `(password, hashedPassword) → Promise<boolean>` | Compares plain text against stored hash. Throws if either argument is invalid. |
| `generateToken` | `(byteLength?: number) → string` | Returns a cryptographically secure random hex string. Default 32 bytes = 64 hex chars. Used for invitation tokens. |

---

#### `src/lib/session.ts` — Session Management [DONE]

Redis-based session store. All session keys use the prefix `session:` with a 7-day TTL.

**`SessionData` type:**
```ts
type SessionData = {
  userId: string
  organizationId: string
  role: "manager" | "worker"
}
```

| Function | Description |
|---|---|
| `createSession(data)` | Generates a 64-char random hex session ID, stores `JSON.stringify(data)` in Redis with 7-day TTL, returns the sessionId. |
| `getSession(sessionId)` | Reads `session:{id}` from Redis, parses JSON. Returns `null` if not found (expired or invalid). |
| `deleteSession(sessionId)` | Deletes `session:{id}` from Redis. Called on signout. |

---

#### `src/middleware/auth.ts` — Auth Middleware [DONE]

`authMiddileware` — Hono middleware that protects any route it is applied to.

**Flow:**
1. Reads the `session` **signed cookie** using `SESSION_SECRET`
2. If cookie missing → `401 Unauthorized`
3. Calls `getSession(sessionId)` — looks up Redis
4. If session not found (expired / tampered) → `401 Session expired`
5. Calls `c.set("user", session)` — attaches `{ userId, organizationId, role }` to context
6. Calls `next()` — proceeds to the route handler

Any route handler after this middleware can access the user via:
```ts
const user = c.get("user") // { userId, organizationId, role }
```

---

#### `src/middleware/requireRole.ts` — RBAC Middleware [STUB]

Will be a factory middleware that checks if the session user has the required role:

```ts
// Planned usage
app.post('/tasks', authMiddileware, requireRole('manager'), createTask)
```

Returns `403 Forbidden` if the user's role doesn't match.

---

#### `src/routes/auth.ts` — Auth Routes [DONE]

Mounts all auth endpoints on a Hono router. Imported and registered in `index.ts` as `/api/v1/auth`.

| Method | Path | Middleware | Handler |
|---|---|---|---|
| POST | `/signup` | — | `signupController` |
| POST | `/signin` | — | `signinController` |
| POST | `/signout` | — | `singoutController` |
| GET | `/me` | `authMiddileware` | Returns `c.get("user")` |

---

#### `src/controllers/auth.ts` — Auth Controllers [DONE]

Three HTTP handler functions. They parse the request, call the service, set/clear cookies, and return JSON.

**`signupController`**
- Parses JSON body → calls `auth.signupService(data)`
- On success: sets signed `session` cookie (httpOnly, Lax, 7 days) → returns `201` with user + org data
- On error: returns `400` with error message

**`signinController`**
- Parses JSON body → calls `auth.singinService(body)`
- On success: sets signed `session` cookie → returns `201` with user + role
- On error: returns `400` with error message

**`singoutController`**
- Reads signed session cookie → calls `deleteSession(sessionId)` on Redis
- Deletes the `session` cookie from browser
- Returns `200 { success: true, message: "Signout successfully!" }`

---

#### `src/services/auth.ts` — Auth Business Logic [DONE]

Core logic that controllers delegate to. Interacts with the DB and Redis directly.

**`signupService(data: { name, email, password, organizationName })`**

1. Validates all fields are present; password must be ≥ 6 chars
2. Checks `users` table for duplicate email → throws if exists
3. Hashes password with bcrypt
4. Runs a **DB transaction**:
   - Inserts new user → gets `userId`
   - Inserts new organization (owner = userId) → gets `orgId`
   - Inserts membership: `{ userId, orgId, role: "manager" }`
5. Creates Redis session → gets `sessionId`
6. Returns `{ success, message, data: { sessionId, user, organization } }`

**`singinService(data: { email, password })`**

1. Validates fields present
2. Queries `users` by email → throws generic error if not found (no user enumeration)
3. bcrypt compares password → throws if mismatch
4. Queries `memberships` for this user → throws if no org found
5. Creates Redis session with `{ userId, organizationId, role }`
6. Returns `{ success, message, data: { sessionId, user, role } }`

---

#### `src/services/index.ts` & `src/controllers/index.ts` — Re-exports [DONE]

Both simply re-export their respective module namespaces:

```ts
import * as auth from "./auth.js"
export { auth }
```

This allows callers to do:
```ts
import { auth } from "@/services/index.js"
auth.signupService(data)
```

---

---

#### `src/middleware/auth.ts` — Auth + RBAC Middleware [DONE]

Now exports two middleware functions:

**`authMiddileware`** — validates session cookie (as described in Auth Strategy above).

**`requiredRoles(...allowedRoles)`** — factory that returns a Hono middleware enforcing role-based access. Must be used after `authMiddileware` (which sets `c.get("user")`).

```ts
invitationRoute.post("/register", authMiddileware, requiredRoles("manager"), handler)
```

Returns `403 Forbidden: insufficient permissions` if user role is not in `allowedRoles`.

---

#### `server/types/index.ts` — Shared Types [DONE]

Shared TypeScript interfaces used across server modules.

```ts
export interface IRoles {
  role: "manager" | "worker"
}
```

Imported by `services/invitations.ts` for type-safe role handling.

---

#### `src/routes/invitations.ts` — Invitation Routes [DONE]

| Method | Path | Middleware | Handler |
|---|---|---|---|
| POST | `/invitations/register` | `authMiddileware`, `requiredRoles("manager")` | `invitationController` |
| GET | `/invitations/list` | `authMiddileware`, `requiredRoles("manager")` | `listInvitationsController` |
| POST | `/invitations/accept` | — | `acceptInvitationController` |

---

#### `src/controllers/invitations.ts` — Invitation Controllers [DONE]

**`invitationController`**
- Reads `user` from context → gets `organizationId`
- Parses body for `email` and optional `role` (defaults to `"worker"`)
- Calls `invitations.createInvitationService(...)` → returns `201` with invitation + invite link

**`listInvitationsController`**
- Reads `organizationId` from session context
- Queries `db.query.invitations.findMany` filtered by `organizationId`
- Returns all invitations for the org (any status)

**`acceptInvitationController`**
- Parses body: `{ token, name, password }`
- Calls `invitations.acceptInvitationService(body)`
- On success: sets signed session cookie → returns `201` with user + role

---

#### `src/services/invitations.ts` — Invitation Business Logic [DONE]

**`createInvitationService({ organizationId, email, role })`**

1. Validates `email` and `role` are present
2. Generates a 64-char hex token via `generateToken(32)`
3. Inserts invitation record: `{ organizationId, email, token, role, status: "pending" }`
4. Returns invitation data + `inviteLink` = `{CLIENT_ORIGIN}/join?token={token}`

> Email sending is not yet wired up — the invite link is returned in the API response for now.

**`acceptInvitationService({ token, name, password })`**

1. Validates all fields; password must be ≥ 5 chars
2. Looks up invitation by `token` → throws if not found
3. Checks `invite.status === "pending"` → throws if already used
4. Checks no existing user with `invite.email` → throws if duplicate
5. Hashes password with `passwordHashingHelper`
6. Runs a **DB transaction**:
   - Inserts new user
   - Inserts membership with `invite.role`
   - Updates invitation `status` → `"accepted"`
7. Creates Redis session: `{ userId, organizationId, role: invite.role }`
8. Returns `{ sessionId, user, role }`

---

#### Remaining Routes / Controllers / Services — `[STUB]`

These files exist but are empty:

| Module | Files | Planned Functions |
|---|---|---|
| Tasks | routes, controllers, services | `createTask`, `listTasks`, `updateTask`, `deleteTask`, `assignTask` |
| Locations | routes, controllers, services | `saveLocation`, `getTeamLocations`, `getUserHistory` |
| Messages | routes, controllers, services | `sendMessage`, `getConversation`, `markRead` |

---

### Client Modules

---

#### `app/layout.tsx` — Root Layout [DONE]

Wraps every page with Geist + Inter fonts, `ThemeProvider` (dark mode), and Tailwind base styles.

---

#### `app/page.tsx` — Home Page [DONE]

Placeholder landing page. Shows "Project ready!" message with a dark mode keyboard shortcut hint.

---

#### `app/globals.css` — Design System [DONE]

Full visual token system using CSS custom properties (OKLch color space):
- 40+ color tokens: `--background`, `--foreground`, `--primary`, `--destructive`, etc.
- Light and dark mode palettes
- Radius scale: `--radius-sm` → `--radius-4xl`
- Chart colors: `--chart-1` → `--chart-5`
- Sidebar color tokens

---

#### `components/theme-provider.tsx` — Dark Mode [DONE]

- `ThemeProvider` — wraps `next-themes` `NextThemesProvider`
- `ThemeHotkey` — listens for `d` key globally to toggle light/dark; disabled inside `<input>` / `<textarea>`

---

#### `components/ui/button.tsx` — Button Component [DONE]

Built with shadcn/ui + CVA.

**Variants:** `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`

**Sizes:** `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

Supports `asChild` prop (Radix Slot) for polymorphic rendering.

---

#### `lib/utils.ts` — Class Utility [DONE]

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Merges Tailwind classes without conflicts. Used by all UI components.

---

#### Auth & Dashboard Pages — `[STUB]`

| Page | Plans |
|---|---|
| `(auth)/login/page.tsx` | Email + password form → `POST /api/v1/auth/signin` → redirect to dashboard |
| `(auth)/signup/page.tsx` | Name + email + password + org name form → `POST /api/v1/auth/signup` |
| `(dashboard)/tasks/page.tsx` | Task list + create form; role-filtered view |
| `(dashboard)/map/page.tsx` | Google Maps with employee location markers (live via Socket.IO) |
| `(dashboard)/chat/page.ts` | DM interface with real-time updates via Socket.IO |
| `(dashboard)/team/page.tsx` | Member list, roles, send invitations |

---

#### `socket-server.ts` — Socket.IO Server [STUB]

Will handle:
- `location:update` — worker pushes GPS; broadcast to manager
- `message:send` — real-time DM delivery
- `task:update` — notify worker when assigned a task
- Session auth on WebSocket handshake (read cookie, validate Redis session)

---

## Implementation Status

### Done

- [x] Project scaffolding (client + server directory structure)
- [x] PostgreSQL connection via Neon + Drizzle (`pg.Pool`)
- [x] Redis connection via Upstash ioredis
- [x] Full database schema (7 tables + 2 pgEnums, all relationships defined)
- [x] Drizzle migration config
- [x] `GET /api/v1/health` endpoint
- [x] **Auth — signup** (`POST /auth/signup`) — creates user + org in DB transaction, sets session cookie
- [x] **Auth — signin** (`POST /auth/signin`) — verifies password, creates Redis session, sets cookie
- [x] **Auth — signout** (`POST /auth/signout`) — deletes Redis session, clears cookie
- [x] **Auth — me** (`GET /auth/me`) — returns session user from cookie
- [x] `authMiddileware` — signed cookie session validation for protected routes
- [x] `requiredRoles()` — RBAC middleware factory (role-based access control)
- [x] `passwordHashingHelper` / `comparePassword` — bcrypt utilities
- [x] `generateToken` — secure random hex for invitation tokens
- [x] Redis session management (`createSession`, `getSession`, `deleteSession`)
- [x] **Invitations — create** (`POST /invitations/register`) — manager creates invite + returns link
- [x] **Invitations — list** (`GET /invitations/list`) — manager lists all org invitations
- [x] **Invitations — accept** (`POST /invitations/accept`) — creates user + membership + sets session
- [x] `server/types/index.ts` — shared `IRoles` type
- [x] Next.js 16 client with App Router
- [x] Tailwind CSS v4 + shadcn/ui design system
- [x] Dark mode toggle (ThemeProvider + `d` key shortcut)
- [x] Button component with variants
- [x] TypeScript configured on both client and server

### Stub / Pending

- [ ] `requireRole.ts` — superseded by `requiredRoles()` in `middleware/auth.ts` (safe to delete)
- [ ] `src/lib/auth-utils.ts` — empty, replaced by `src/lib/auth.ts` (safe to delete)
- [ ] Invitation decline endpoint (`POST /invitations/decline`)
- [ ] Email sending for invitations (invite link currently returned in API response only)

### Not Started

- [ ] Task CRUD endpoints
- [ ] Location tracking endpoints
- [ ] Messaging endpoints
- [ ] Socket.IO server (real-time location + chat)
- [ ] Login & signup pages (client)
- [ ] Dashboard pages (tasks, map, chat, team)
- [ ] Google Maps JavaScript API integration (`@googlemaps/js-api-loader`)
- [ ] API client (axios instance with `credentials: "include"` for cookies)
- [ ] Custom React hooks (`useAuth`, `useSocket`, `useTasks`, etc.)
- [ ] File uploads (Cloudflare R2)
- [ ] Email service (Gmail SMTP for invitations)

---

## Roadmap

| Week | Feature | Status |
|---|---|---|
| 1 | Project setup (server + client + DB schema) | Done |
| 2 | Auth & multi-tenancy (signup, signin, signout, session) | Done |
| 3 | Invitations (create, accept, list — email sending pending) | In Progress |
| 4 | Task management (CRUD, assignment, status) | Pending |
| 5 | Real-time location (Socket.IO, Google Maps) | Pending |
| 6 | Real-time chat (DMs, read receipts) | Pending |
| 7 | Dashboard (stats, overview, notifications) | Pending |
| 8–13 | Polish, testing, deployment, extras | Pending |
