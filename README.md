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
| Forms | React Hook Form + Zod | — | Form state management + schema validation |
| Backend | Hono | 4.12.25 | Lightweight HTTP API server |
| Backend Runtime | Node.js via `@hono/node-server` | 1.19.14 | Node adapter for Hono |
| Backend Validation | Zod | — | Request body schema validation |
| Database | PostgreSQL (Neon serverless) | — | Primary persistent storage |
| ORM | Drizzle ORM | 0.45.2 | Type-safe DB queries & migrations |
| Cache / Session | Redis (Upstash) via ioredis | 5.11.1 | Session store, real-time pub/sub |
| Password Hashing | bcrypt | — | Secure password hashing |
| HTTP Client | axios | — | API calls from client with cookie support |
| Toast | Sonner | — | Toast notifications on client |
| Real-time | Socket.IO | — | Live location updates, chat (planned) |
| Maps | Google Maps JavaScript API | — | Interactive map with markers (planned) |
| File Storage | Cloudflare R2 | — | User uploads (planned) |
| Email | Gmail SMTP | — | Invitations, notifications (planned) |

---

## Project Structure

```
fieldforce/
├── client/                            # Next.js 16 frontend (App Router)
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signup/page.tsx        # [DONE] Signup page (form + hook)
│   │   │   └── signin/page.tsx        # [DONE] Signin page (form + hook)
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # [DONE] Dashboard home (signout button)
│   │   │   ├── tasks/page.tsx         # [STUB] Task management page
│   │   │   ├── map/page.tsx           # [STUB] Live location map page
│   │   │   ├── chat/page.ts           # [STUB] Real-time chat page
│   │   │   └── team/page.tsx          # [STUB] Team management page
│   │   ├── globals.css                # [DONE] Global styles, Tailwind v4 theme
│   │   ├── layout.tsx                 # [DONE] Root layout with ThemeProvider
│   │   └── page.tsx                   # [DONE] Landing/home page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx             # [DONE] shadcn Button (CVA variants)
│   │   │   ├── card.tsx               # [DONE] shadcn Card component
│   │   │   ├── form.tsx               # [DONE] shadcn Form (react-hook-form integration)
│   │   │   ├── input.tsx              # [DONE] shadcn Input component
│   │   │   ├── label.tsx              # [DONE] shadcn Label component
│   │   │   └── sonner.tsx             # [DONE] Sonner toast wrapper
│   │   ├── auth/
│   │   │   └── signup.tsx             # [STUB] Reusable signup component
│   │   └── theme-provider.tsx         # [DONE] Dark mode provider ('d' key toggle)
│   ├── hooks/
│   │   └── auth/
│   │       ├── signup.ts              # [DONE] useSignup() hook
│   │       ├── signin.ts              # [DONE] useSignin() hook
│   │       └── signout.ts             # [DONE] useSignout() hook
│   ├── lib/
│   │   ├── api.ts                     # [DONE] axios instance (withCredentials)
│   │   └── utils.ts                   # [DONE] cn(), copyToClipboard(), handleAxiosError()
│   ├── validations/
│   │   └── zod.ts                     # [DONE] Zod schemas: signupSchema, singinSchema
│   ├── middleware.ts                   # [DONE] Next.js route protection middleware
│   ├── .env                           # Frontend env vars (API_URL, SOCKET_URL)
│   ├── .env.example                   # Env template
│   ├── components.json                # shadcn/ui config
│   ├── next.config.ts                 # Next.js config (empty, uses defaults)
│   ├── postcss.config.mjs             # PostCSS with Tailwind v4 plugin
│   ├── tsconfig.json                  # TypeScript config, @ alias
│   └── package.json
│
├── server/                            # Hono REST API server
│   ├── src/
│   │   ├── index.ts                   # [DONE] App entry — health + auth + invitation routes
│   │   ├── db/
│   │   │   ├── schema.ts              # [DONE] Drizzle schema — 7 tables + 2 pgEnums
│   │   │   └── index.ts               # [DONE] PostgreSQL pool + Drizzle db instance
│   │   ├── errors/
│   │   │   └── index.ts               # [DONE] Centralized HTTP error handler functions
│   │   ├── lib/
│   │   │   ├── redis.ts               # [DONE] Redis client singleton
│   │   │   ├── auth.ts                # [DONE] passwordHashingHelper, comparePassword, generateToken
│   │   │   └── session.ts             # [DONE] Redis session create / get / delete
│   │   ├── middleware/
│   │   │   ├── auth.ts                # [DONE] authMiddileware + requiredRoles (RBAC)
│   │   │   └── requireRole.ts         # [STUB] Superseded by requiredRoles in auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts                # [DONE] /api/v1/auth/* (signup, signin, signout, me)
│   │   │   ├── invitations.ts         # [DONE] /api/v1/invitations/* (register, list, accept)
│   │   │   ├── locations.ts           # [STUB] /api/v1/locations/*
│   │   │   ├── messages.ts            # [STUB] /api/v1/messages/*
│   │   │   └── tasks.ts               # [STUB] /api/v1/tasks/*
│   │   ├── controllers/
│   │   │   ├── index.ts               # [DONE] Re-exports: auth, invitation
│   │   │   ├── auth.ts                # [DONE] signupController, signinController, singoutController, fetchMe
│   │   │   ├── invitations.ts         # [DONE] invitationController, listInvitationsController, acceptInvitationController
│   │   │   ├── locations.ts           # [STUB] Location HTTP handlers
│   │   │   ├── messages.ts            # [STUB] Message HTTP handlers
│   │   │   └── tasks.ts               # [STUB] Task HTTP handlers
│   │   └── services/
│   │       ├── index.ts               # [DONE] Re-exports: auth, invitations
│   │       ├── auth.ts                # [DONE] signupService, singinService + Zod schemas
│   │       ├── invitations.ts         # [DONE] createInvitationService, acceptInvitationService, fetchInvitations
│   │       ├── locations.ts           # [STUB] Location business logic
│   │       ├── messages.ts            # [STUB] Message business logic
│   │       └── tasks.ts               # [STUB] Task business logic
│   ├── types/
│   │   └── index.ts                   # [DONE] Shared TypeScript types (IRoles)
│   ├── .env                           # Server env vars (DB, Redis, API keys)
│   ├── .env.example                   # Env template
│   ├── drizzle.config.ts              # Drizzle ORM + migration config
│   ├── tsconfig.json                  # TypeScript config, @ alias → src/*
│   └── package.json
│
├── socket-server.ts                   # [STUB] Socket.IO server (real-time)
└── README.md                          # This file
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Next.js)                      │
│  /auth/signup  /auth/signin  →  /dashboard/*            │
│  middleware.ts guards routes (cookie check)             │
│  axios (withCredentials) → Hono API  |  Socket.IO       │
└───────────────────────┬──────────────────────────────────┘
                        │ REST (port 8000)
┌───────────────────────▼──────────────────────────────────┐
│               Server (Hono API)                          │
│  /api/v1/auth  /invitations  /tasks  /locations  ...    │
│  Middleware: authMiddileware → requiredRoles (RBAC)      │
│  Routes → Controllers → Services (Zod) → DB / Redis      │
└────────┬──────────────────────┬───────────────────────────┘
         │                      │
┌────────▼──────┐   ┌───────────▼──────────────────────────┐
│  PostgreSQL   │   │  Redis (Upstash)                      │
│  (Neon)       │   │  session:{id} → { userId, orgId,      │
│  Primary data │   │    role }  TTL: 7 days                │
└───────────────┘   └──────────────────────────────────────┘
```

### Multi-Tenancy Model

Every resource (Task, Location, Message, Invitation) belongs to an `Organization`. A `User` can be a member of multiple organizations through the `Memberships` table. The `role` field controls what the user can do within each organization.

```
User ──── Memberships ──── Organization
           (role: manager | worker)
```

---

## Auth Strategy

FieldForce uses **Redis-backed session authentication** (no JWT tokens).

### How it works

```
[POST /auth/signup or /auth/signin]
        │
        ▼
  Zod schema validation → reject with field errors if invalid
        │
        ▼
  Business logic (check email, hash password, query DB)
        │
        ▼
  Create session in Redis:
    Key:   session:{randomHex64}
    Value: JSON { userId, organizationId, role }
    TTL:   7 days
        │
        ▼
  Set signed HTTP-only cookie:
    Name:     session
    Value:    sessionId (signed with SESSION_SECRET)
    httpOnly: true  |  sameSite: Lax  |  maxAge: 7 days
    secure:   true in production
        │
        ▼
  Return user + org info as JSON
```

### Protected routes (server)

```
Request → authMiddileware
  getSignedCookie → validate signature
  redis.get("session:{id}") → parse SessionData
  null/expired? → delete cookie + 401
  found? → c.set("user", session) → next()
```

### Role-based access

```
authMiddileware → requiredRoles("manager")
  c.get("user").role — not in allowedRoles? → 403 Forbidden
```

### Route protection (client)

`client/middleware.ts` runs on every matching request via Next.js Edge Runtime:
- Unauthenticated user on `/dashboard/*`, `/my-tasks`, `/team`, `/map`, `/chat` → redirect to `/auth/signin?from=pathname`
- Authenticated user on `/auth/signin` or `/auth/signup` → redirect to `/dashboard`

### Signout

```
[POST /auth/signout]
  redis.del("session:{id}")   ← server-side invalidation
  deleteCookie("session")     ← client cookie cleared
```

---

## Database Schema

Defined in [server/src/db/schema.ts](server/src/db/schema.ts). DB instance in [server/src/db/index.ts](server/src/db/index.ts) uses `pg.Pool` + Drizzle with full schema for relational queries.

**pgEnums:**
- `roleEnum` — `"manager" | "worker"` — used in `memberships.role` and `invitations.role`
- `invitationStatuses` — `"pending" | "accepted" | "declined"` — used in `invitations.status`

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Required |
| `email` | VARCHAR(255) | Unique, required |
| `password` | VARCHAR(255) | bcrypt hashed |
| `created_at` | TIMESTAMP | Auto set |
| `updated_at` | TIMESTAMP | Auto set |

### `organizations`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Organization name |
| `owner_id` | UUID | FK → users.id (creator / first manager) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `memberships`

Links users to organizations with a role.

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

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `email` | VARCHAR(255) | Invitee email |
| `token` | VARCHAR(255) | Secure random hex token (64 chars) |
| `role` | ENUM (`roleEnum`) | Role the invitee will receive |
| `status` | ENUM (`invitationStatuses`) | `"pending"` (default) / `"accepted"` / `"declined"` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `tasks`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `title` | VARCHAR(255) | Task title |
| `description` | VARCHAR(1000) | Detailed description |
| `creator_id` | UUID | FK → users.id (manager) |
| `assigned_to` | UUID | FK → users.id (worker, nullable) |
| `status` | VARCHAR(50) | `"pending"` / `"in_progress"` / `"completed"` |
| `latitude` | INTEGER | Task site location (nullable) |
| `longitude` | INTEGER | Task site location (nullable) |
| `deadline` | INTEGER | Unix timestamp (nullable) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `locations`

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

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → organizations.id |
| `sender_id` | UUID | FK → users.id |
| `receiver_id` | UUID | FK → users.id |
| `content` | VARCHAR(1000) | Message body |
| `read_at` | TIMESTAMP | NULL until read |
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
| POST | `/auth/signup` | None | **DONE** | Register user + org + set session cookie |
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

**Error response format (Zod validation failure):**
```json
{
  "success": false,
  "error": { "message": "Invalid request body", "code": 400 },
  "fields": [
    { "name": "email", "message": "Invalid email" }
  ]
}
```

### Invitations

| Method | Path | Auth | Role | Status | Description |
|---|---|---|---|---|---|
| POST | `/invitations/register` | Cookie | manager | **DONE** | Create invitation + return invite link |
| GET | `/invitations/list` | Cookie | manager | **DONE** | List all org invitations |
| POST | `/invitations/accept` | None | — | **DONE** | Accept invite → create user + session |
| POST | `/invitations/decline` | None | — | STUB | Decline an invitation |

**`POST /invitations/register` body:**
```json
{ "email": "worker@example.com", "role": "worker" }
```

**`POST /invitations/accept` body:**
```json
{ "token": "abc123...", "name": "Field Worker", "password": "secret123" }
```

### Tasks — `[STUB]`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/tasks` | Cookie | manager | Create a new task |
| GET | `/tasks` | Cookie | any | List tasks (role-filtered) |
| GET | `/tasks/:id` | Cookie | any | Get task details |
| PATCH | `/tasks/:id` | Cookie | any | Update task (status / assignment) |
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
PORT=8000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
REDIS_URL=rediss://user:pass@host:6380

# Used to sign session cookies — must be a long random string
SESSION_SECRET=your-random-secret-here

EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password

GOOGLE_MAPS_API_KEY=your-key

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
cp .env.example .env
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

#### `src/errors/index.ts` — Centralized Error Handlers [DONE]

All HTTP error responses go through these functions. Every controller uses them instead of `c.json(...)` directly, ensuring a consistent response shape.

| Function | Status | Response Shape |
|---|---|---|
| `serverError(c, error)` | 500 | `{ success, message, stack }` (stack hidden in production) |
| `badRequestError(c, { message, fields })` | 400 | `{ success, error: { message, code }, fields }` |
| `conflictError(c, { message, fields })` | 409 | `{ success, error: { message, code }, fields }` |
| `notFoundError(c)` | 404 | `{ success, message: "Not Found - [METHOD] URL" }` |
| `authenticationError(c, message)` | 401 | `{ success, error: { message, code } }` |
| `authorizationError(c, message)` | 403 | `{ success, error: { message, code } }` |
| `schemaValidationError(zodError, message)` | — | Converts Zod `.issues` → `{ message, fields: [{ name, message }] }` |

`schemaValidationError` is a helper (not a Hono handler) — it converts a Zod parse error into the `fields` format used by `badRequestError`. Services call it and return `{ error }` which controllers pass to `badRequestError`.

---

#### `src/db/index.ts` — DB Instance [DONE]

```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
```

Throws on startup if `DATABASE_URL` is missing. Imported by all services.

---

#### `src/db/schema.ts` — Database Schema [DONE]

Defines 2 pgEnums + 7 Drizzle table definitions + TypeScript types. Import in services:

```ts
import { users, tasks, memberships, invitations } from '@/db/schema.js'
```

---

#### `src/lib/redis.ts` — Redis Client [DONE]

Singleton `redis` ioredis instance connected via `REDIS_URL`.

---

#### `src/lib/auth.ts` — Auth Utilities [DONE]

| Function | Description |
|---|---|
| `passwordHashingHelper(password)` | bcrypt hash with 10 salt rounds. Throws on empty/non-string input. |
| `comparePassword(password, hash)` | bcrypt compare. Throws on invalid inputs. |
| `generateToken(byteLength?)` | Cryptographically secure random hex. Default 32 bytes = 64 hex chars. |

---

#### `src/lib/session.ts` — Session Management [DONE]

Redis session store. Key pattern: `session:{id}`. Default TTL: 7 days.

```ts
type SessionData = { userId: string; organizationId: string; role: "manager" | "worker" }
```

| Function | Description |
|---|---|
| `createSession(data, ttl?)` | Generates 64-char hex ID, stores JSON in Redis, returns sessionId. Optional custom TTL. |
| `getSession(sessionId)` | Reads and parses session. Returns `null` if expired or not found. |
| `deleteSession(sessionId)` | Removes session from Redis. Called on signout. |

---

#### `src/middleware/auth.ts` — Auth + RBAC Middleware [DONE]

**`authMiddileware`**
1. Reads signed `session` cookie via `SESSION_SECRET`
2. Missing cookie → `401 Unauthorized`
3. Calls `getSession(sessionId)` — Redis lookup
4. Not found (expired) → deletes stale cookie + `401 Session expired`
5. Found → `c.set("user", session)` → `next()`

**`requiredRoles(...allowedRoles)`**
- Factory: returns a Hono middleware
- Reads `c.get("user").role` — checks against `allowedRoles`
- Fails → `403 Forbidden: insufficient permissions`
- Must be placed after `authMiddileware`

```ts
route.post("/register", authMiddileware, requiredRoles("manager"), handler)
```

---

#### `src/routes/auth.ts` — Auth Routes [DONE]

| Method | Path | Middleware | Handler |
|---|---|---|---|
| POST | `/signup` | — | `auth.signupController` |
| POST | `/signin` | — | `auth.signinController` |
| POST | `/signout` | — | `auth.singoutController` |
| GET | `/me` | `authMiddileware` | `auth.fetchMe` |

---

#### `src/controllers/auth.ts` — Auth Controllers [DONE]

All controllers use `badRequestError`, `serverError`, `authenticationError` from `errors/index.ts`. Services return `{ error }`, `{ serverError }`, or a success object — controllers branch on these.

**`signupController`** — calls `auth.signupService(body)` → sets signed cookie on success → `201`

**`signinController`** — calls `auth.singinService(body)` → sets signed cookie on success → `201`

**`singoutController`** — reads cookie → `deleteSession` on Redis → clears cookie → `200`

**`fetchMe`** — reads `c.get("user")` (set by middleware) → returns user session data → `200`

---

#### `src/services/auth.ts` — Auth Service [DONE]

All functions validate input with Zod (`safeParse`) and return structured objects instead of throwing. Controllers check the return value and call the right error handler.

**Exported:**

**`signupService(body)`** — Zod schema: `{ name (min 3), email, password (6–20), organizationName }`
1. Validates body with `ZUserSchema.safeParse` → returns `{ error }` on failure
2. Checks for duplicate email
3. Hashes password
4. DB transaction: insert user → insert organization → insert membership (role: `"manager"`)
5. Creates Redis session → returns `{ success, data: { sessionId, user, organization } }`

**`singinService(body)`** — Zod schema: `{ email, password (6–20) }`
1. Validates body with `ZSignin.safeParse`
2. Queries user by email — returns generic `"Invalid credentials"` error (no user enumeration)
3. bcrypt compare — same generic error on mismatch
4. Queries membership → creates Redis session → returns `{ success, data: { sessionId, user, role } }`

**Not yet wired to routes (defined but not exported):**
- `changePassword({ user, body })` — validates `{ currentPassword, newPassword, confirmPassword }` with Zod; updates password in DB
- `forgotPassword(email)` — generates reset token stored in in-memory Map; builds reset URL
- `resetPassword({ password, resetToken })` — validates token from Map; updates hashed password in DB

---

#### `src/routes/invitations.ts` — Invitation Routes [DONE]

| Method | Path | Middleware | Handler |
|---|---|---|---|
| POST | `/register` | `authMiddileware`, `requiredRoles("manager")` | `invitation.invitationController` |
| GET | `/list` | `authMiddileware`, `requiredRoles("manager")` | `invitation.listInvitationsController` |
| POST | `/accept` | — | `invitation.acceptInvitationController` |

---

#### `src/controllers/invitations.ts` — Invitation Controllers [DONE]

**`invitationController`** — reads `user.organizationId` from session context → calls `createInvitationService` → `201`

**`listInvitationsController`** — reads `user.organizationId` → calls `fetchInvitations` from service → returns list

**`acceptInvitationController`** — parses body → calls `acceptInvitationService` → sets signed session cookie on success → `201`

---

#### `src/services/invitations.ts` — Invitation Service [DONE]

All functions use Zod `safeParse` and return `{ error }` / `{ serverError }` / success.

**`createInvitationService(body)`** — Zod: `{ organizationId, email, role: enum }`
1. Generates 64-char token
2. Inserts invitation: `{ organizationId, email, token, role, status: "pending" }`
3. Returns invitation + `inviteLink = {CLIENT_ORIGIN}/join?token={token}`

> Email sending not yet implemented — invite link is returned in the API response for now.

**`acceptInvitationService(body)`** — Zod: `{ token, password (6–20), name (min 3) }`
1. Looks up invitation by token → error if not found
2. Checks `status === "pending"` → error if already used
3. Checks no existing user with that email
4. Hashes password → DB transaction: insert user + membership + mark invite `"accepted"`
5. Creates Redis session → returns `{ sessionId, user, role }`

**`fetchInvitations({ organizationId })`**
- Queries all invitations for the org (any status)
- Returns `{ success, data: [...] }`

---

#### `server/types/index.ts` — Shared Types [DONE]

```ts
export interface IRoles {
  role: "manager" | "worker"
}
```

---

#### Remaining Stubs

| Module | Planned Functions |
|---|---|
| `services/tasks.ts` | `createTask`, `listTasks`, `updateTask`, `deleteTask` |
| `services/locations.ts` | `saveLocation`, `getTeamLocations`, `getUserHistory` |
| `services/messages.ts` | `sendMessage`, `getConversation`, `markRead` |

---

### Client Modules

---

#### `middleware.ts` — Route Protection [DONE]

Next.js Edge Runtime middleware. Runs on every request matching the `config.matcher`.

**Protected routes** (require session cookie): `/dashboard/*`, `/my-tasks`, `/team`, `/map`, `/chat`
- No cookie → redirect to `/auth/signin?from={pathname}`

**Auth routes** (redirect if already logged in): `/auth/signin`, `/auth/signup`
- Cookie present → redirect to `/dashboard`

```ts
const sessionCookie = request.cookies.get("session")
const isLoggedIn = Boolean(sessionCookie)
```

> Note: This only checks cookie presence, not validity. Full validation happens server-side via `authMiddileware`.

---

#### `lib/api.ts` — Axios Instance [DONE]

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,                // sends the session cookie with every request
  headers: { "Content-Type": "application/json" },
})
```

All hooks import this instance instead of using raw `fetch` or a new axios instance.

---

#### `validations/zod.ts` — Form Schemas [DONE]

Client-side Zod schemas for form validation via `react-hook-form` + `zodResolver`.

| Schema | Fields | Validation Rules |
|---|---|---|
| `signupSchema` | `name`, `email`, `organizationName`, `password` | name ≥ 2 chars, valid email, org ≥ 2 chars, password 6–20 chars |
| `singinSchema` | `email`, `password` | valid email, password 6–20 chars |

Exported types: `SignupValues`, `SigninValues`

---

#### `hooks/auth/signup.ts` — `useSignup()` [DONE]

Manages the signup form state, validation, and API call.

```ts
const { form, handleSubmit } = useSignup()
```

- `form` — react-hook-form instance with `signupSchema` Zod resolver
- `handleSubmit(values)` — calls `api.post("/auth/signup", values)` → redirects to `/dashboard` on success → shows `toast.error` + sets field errors from server `fields` array on failure
- Uses `handleAxiosError` for Axios-level error handling

---

#### `hooks/auth/signin.ts` — `useSignin()` [DONE]

Same pattern as `useSignup` for the signin form.

- `form` — react-hook-form with `singinSchema`
- `handleSubmit(values)` — calls `api.post("/auth/signin", values)` → redirects to `/dashboard` on success

---

#### `hooks/auth/signout.ts` — `useSignout()` [DONE]

```ts
const { loading, handleSingout } = useSignout()
```

- `handleSingout()` — calls `api.post("/auth/signout")` → redirects to `/auth/signin` on success
- `loading` — boolean for disabling the signout button during the request

---

#### `app/auth/signup/page.tsx` — Signup Page [DONE]

Full signup form built with shadcn UI:
- FieldForce logo header (Radar icon)
- Card layout with 4 fields: Full name, Work email (with Mail icon), Company name (with Building2 icon), Password (with show/hide toggle)
- Submit button shows loading state (`"Creating account…"`)
- Terms & Privacy links at bottom
- Link to signin page

Uses `useSignup()` hook for all form logic.

---

#### `app/auth/signin/page.tsx` — Signin Page [DONE]

Full signin form:
- FieldForce logo header
- Card with 2 fields: Work email, Password (with show/hide toggle)
- "Forgot password?" link
- Submit button with loading state
- Link to signup page

Uses `useSignin()` hook.

---

#### `app/dashboard/page.tsx` — Dashboard Home [DONE]

Placeholder dashboard. Shows "welcome to the dashboard" + a `Signout` button using `useSignout()`.

---

#### `app/dashboard/*` — Dashboard Sub-pages [STUB]

| Page | Plans |
|---|---|
| `tasks/page.tsx` | Task list + create form (role-filtered) |
| `map/page.tsx` | Google Maps with live employee location markers |
| `chat/page.ts` | Real-time direct messaging (Socket.IO) |
| `team/page.tsx` | Team members list, roles, invite new members |

---

#### `lib/utils.ts` — Utilities [DONE]

| Function | Description |
|---|---|
| `cn(...inputs)` | Merges Tailwind classes without conflicts (clsx + twMerge) |
| `copyToClipboard(text)` | Copies text to clipboard + shows `toast.success("Copied!")` |
| `formatMony(price)` | Formats number as `"BDT 1,000"` |
| `handleAxiosError(error)` | Handles Axios errors: reads `error.response.data.error.message`, shows toast, returns `{ message, status }` |

---

#### `components/ui/*` — shadcn UI Components [DONE]

| Component | Description |
|---|---|
| `button.tsx` | Button with CVA variants (default, outline, secondary, ghost, destructive, link) and sizes |
| `card.tsx` | Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription |
| `form.tsx` | Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage — wraps react-hook-form |
| `input.tsx` | Styled `<input>` element |
| `label.tsx` | Styled `<label>` via Radix Label primitive |
| `sonner.tsx` | Toaster component from sonner (wraps the provider) |

---

#### `components/theme-provider.tsx` — Dark Mode [DONE]

- `ThemeProvider` — wraps `next-themes` provider
- `ThemeHotkey` — `d` key toggles light/dark; disabled inside inputs

---

## Implementation Status

### Done

- [x] Project scaffolding (client + server structure)
- [x] PostgreSQL via Neon + Drizzle (`pg.Pool`)
- [x] Redis via Upstash ioredis
- [x] Full database schema (7 tables + 2 pgEnums)
- [x] Drizzle migration config
- [x] `GET /api/v1/health` endpoint
- [x] Centralized error handler module (`src/errors/index.ts`)
- [x] Zod request validation on all implemented services
- [x] **Auth — signup** — creates user + org + membership in DB transaction, sets session cookie
- [x] **Auth — signin** — validates credentials, creates Redis session, sets cookie
- [x] **Auth — signout** — deletes Redis session, clears cookie
- [x] **Auth — me** — returns session user via cookie
- [x] `authMiddileware` — signed cookie session validation
- [x] `requiredRoles()` — RBAC middleware factory
- [x] `passwordHashingHelper` / `comparePassword` — bcrypt utilities
- [x] `generateToken` — secure random hex for invitation tokens
- [x] Redis session management (`createSession`, `getSession`, `deleteSession`)
- [x] **Invitations — create** (`POST /invitations/register`)
- [x] **Invitations — list** (`GET /invitations/list`)
- [x] **Invitations — accept** (`POST /invitations/accept`)
- [x] Next.js middleware — route protection (session cookie check)
- [x] axios API client (`lib/api.ts`) with `withCredentials: true`
- [x] Zod form schemas (`validations/zod.ts`) — signupSchema, singinSchema
- [x] `useSignup()` hook — form + API call + error handling
- [x] `useSignin()` hook — form + API call + redirect
- [x] `useSignout()` hook — API call + redirect + loading state
- [x] Signup page (`/auth/signup`) — full form UI
- [x] Signin page (`/auth/signin`) — full form UI
- [x] Dashboard home (`/dashboard`) — signout button
- [x] Tailwind CSS v4 + shadcn/ui design system (Button, Card, Form, Input, Label, Sonner)
- [x] Dark mode toggle (ThemeProvider + `d` key)
- [x] `handleAxiosError`, `copyToClipboard`, `formatMony` utilities

### Stub / Pending

- [ ] Invitation decline endpoint
- [ ] Email sending for invitations (link returned in API response only)
- [ ] `changePassword`, `forgotPassword`, `resetPassword` — defined in service, not exposed via routes yet
- [ ] `requireRole.ts` — superseded, can be deleted
- [ ] `src/lib/auth-utils.ts` — empty, can be deleted
- [ ] `components/auth/signup.tsx` — empty stub

### Not Started

- [ ] Task CRUD endpoints + UI
- [ ] Location tracking endpoints + UI
- [ ] Messaging endpoints + UI
- [ ] Socket.IO server (real-time location + chat)
- [ ] Dashboard sub-pages (tasks, map, chat, team)
- [ ] Google Maps JavaScript API (`@googlemaps/js-api-loader`)
- [ ] File uploads (Cloudflare R2)
- [ ] Email service (Gmail SMTP)

---

## Roadmap

| Week | Feature | Status |
|---|---|---|
| 1 | Project setup (server + client + DB schema) | Done |
| 2 | Auth (signup, signin, signout, session, Zod validation) | Done |
| 3 | Invitations (create, accept, list) + Client auth pages | In Progress |
| 4 | Task management (CRUD, assignment, status) | Pending |
| 5 | Real-time location (Socket.IO, Google Maps) | Pending |
| 6 | Real-time chat (DMs, read receipts) | Pending |
| 7 | Dashboard (stats, overview, notifications) | Pending |
| 8–13 | Polish, testing, deployment, extras | Pending |
