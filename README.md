# FieldForce

A multi-tenant SaaS application for managing field teams. Managers can assign tasks to field workers, track their live GPS locations on an interactive map, and communicate with them in real time via chat.

> Work in progress — building in public over 90 days.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Dual Interface Design](#dual-interface-design)
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
| Forms | React Hook Form + Zod | — | Form state + schema validation |
| State | React Context API | — | Auth state (user, role) |
| Backend | Hono | 4.12.25 | Lightweight HTTP API server |
| Backend Runtime | Node.js via `@hono/node-server` | 1.19.14 | Node adapter for Hono |
| Backend Validation | Zod | — | Request body schema validation |
| Database | PostgreSQL (Neon serverless) | — | Primary persistent storage |
| ORM | Drizzle ORM | 0.45.2 | Type-safe DB queries & migrations |
| Cache / Session | Redis (Upstash) via ioredis | 5.11.1 | Session store, real-time pub/sub |
| Password Hashing | bcrypt | — | Secure password hashing |
| HTTP Client | axios | — | API calls with cookie support |
| Maps | Google Maps JavaScript API | — | Location picker, task map, navigation |
| Toast | Sonner | — | Toast notifications |
| Real-time | Socket.IO | — | Live location + chat (planned) |
| File Storage | Cloudflare R2 | — | User uploads (planned) |
| Email | Gmail SMTP | — | Invitations (planned) |

---

## Project Structure

```
fieldforce/
├── client/                                   # Next.js 16 frontend
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signup/page.tsx               # [DONE] Signup form page
│   │   │   └── signin/page.tsx               # [DONE] Signin form page
│   │   ├── dashboard/                        # Manager interface
│   │   │   ├── layout.tsx                    # [DONE] Sidebar layout
│   │   │   ├── page.tsx                      # [DONE] Manager dashboard home
│   │   │   ├── tasks/page.tsx                # [DONE] Task table + create + edit panel
│   │   │   ├── map/page.tsx                  # [STUB] Live map page
│   │   │   ├── chat/page.tsx                 # [STUB] Manager chat page
│   │   │   └── team/page.tsx                 # [STUB] Team management page
│   │   ├── chat-list/page.tsx                # [DONE] Worker conversation list
│   │   ├── chat/page.tsx                     # [DONE] Worker chat interface (mock data)
│   │   ├── profile/page.tsx                  # [DONE] Worker profile + settings
│   │   ├── tasks/[id]/page.tsx               # [DONE] Worker task detail page
│   │   ├── globals.css                       # [DONE] Tailwind v4 + theme tokens
│   │   ├── layout.tsx                        # [DONE] Root layout (Providers + GoogleMapsScript)
│   │   └── page.tsx                          # [DONE] Worker home — task list with stats
│   ├── components/
│   │   ├── ui/
│   │   │   ├── avatar.tsx                    # [DONE] Avatar + AvatarGroup
│   │   │   ├── breadcrumb.tsx                # [DONE] Breadcrumb nav
│   │   │   ├── button.tsx                    # [DONE] Button (CVA variants)
│   │   │   ├── card.tsx                      # [DONE] Card layout
│   │   │   ├── collapsible.tsx               # [DONE] Collapsible/accordion
│   │   │   ├── dropdown-menu.tsx             # [DONE] Dropdown menu system
│   │   │   ├── form.tsx                      # [DONE] react-hook-form integration
│   │   │   ├── input.tsx                     # [DONE] Input field
│   │   │   ├── label.tsx                     # [DONE] Label
│   │   │   ├── separator.tsx                 # [DONE] Horizontal/vertical divider
│   │   │   ├── sheet.tsx                     # [DONE] Slide-out sheet/drawer
│   │   │   ├── sidebar.tsx                   # [DONE] Full sidebar system
│   │   │   ├── skeleton.tsx                  # [DONE] Loading skeleton
│   │   │   ├── sonner.tsx                    # [DONE] Toast provider
│   │   │   └── tooltip.tsx                   # [DONE] Tooltip
│   │   ├── dashboard/
│   │   │   └── manager-task-panel.tsx        # [DONE] Task edit side panel
│   │   ├── worker/
│   │   │   ├── bottom-navigation.tsx         # [DONE] Mobile tab bar
│   │   │   ├── task-detail-sheet.tsx         # [DONE] Full-screen task detail
│   │   │   └── task-map.tsx                  # [DONE] Google Maps task map
│   │   ├── auth/
│   │   │   └── signup.tsx                    # [STUB] Reusable signup component
│   │   ├── app-sidebar.tsx                   # [DONE] Manager sidebar (nav + user)
│   │   ├── create-task-modal.tsx             # [DONE] Task creation modal with maps
│   │   ├── google-maps-script.tsx            # [DONE] Async Google Maps loader
│   │   ├── nav-main.tsx                      # [DONE] Sidebar main nav items
│   │   ├── nav-projects.tsx                  # [DONE] Sidebar projects section
│   │   ├── nav-user.tsx                      # [DONE] Sidebar user footer
│   │   ├── providers.tsx                     # [DONE] Root providers wrapper
│   │   ├── roleGate.tsx                      # [DONE] Role-based render guard
│   │   ├── team-switcher.tsx                 # [DONE] Sidebar team/org display
│   │   └── theme-provider.tsx                # [DONE] Dark mode provider
│   ├── context/
│   │   └── authContext.ts                    # [DONE] AuthProvider + useUser hook
│   ├── hooks/
│   │   ├── auth/
│   │   │   ├── signup.ts                     # [DONE] useSignup()
│   │   │   ├── signin.ts                     # [DONE] useSignin()
│   │   │   └── signout.ts                    # [DONE] useSignout()
│   │   ├── dashboard/tasks/
│   │   │   └── useTasks.ts                   # [DONE] Fetch task list
│   │   ├── use-mobile.ts                     # [DONE] useIsMobile() hook
│   │   ├── useUpdateTaskStatus.ts            # [DONE] Patch task status
│   │   └── useWorkers.ts                     # [DONE] Fetch worker list
│   ├── interfaces/
│   │   └── index.ts                          # [DONE] ITask, IWorker, TaskStatus etc.
│   ├── lib/
│   │   ├── api.ts                            # [DONE] axios instance (withCredentials)
│   │   └── utils.ts                          # [DONE] cn, handleAxiosError, etc.
│   ├── validations/
│   │   └── zod.ts                            # [DONE] Zod schemas (auth + tasks)
│   ├── middleware.ts                          # [DONE] Route protection middleware
│   ├── .env                                  # Frontend env vars
│   ├── components.json                       # shadcn/ui config
│   ├── next.config.ts
│   └── package.json
│
├── server/                                   # Hono REST API
│   ├── src/
│   │   ├── index.ts                          # [DONE] Entry — CORS + all routes
│   │   ├── db/
│   │   │   ├── schema.ts                     # [DONE] 7 tables + 2 pgEnums + relations
│   │   │   └── index.ts                      # [DONE] pg.Pool + Drizzle instance
│   │   ├── errors/
│   │   │   └── index.ts                      # [DONE] HTTP error handler functions
│   │   ├── lib/
│   │   │   ├── redis.ts                      # [DONE] Redis singleton
│   │   │   ├── auth.ts                       # [DONE] bcrypt + token utils
│   │   │   └── session.ts                    # [DONE] Redis session CRUD
│   │   ├── middleware/
│   │   │   ├── auth.ts                       # [DONE] authMiddileware + requiredRoles
│   │   │   └── requireRole.ts                # [STUB] Superseded
│   │   ├── routes/
│   │   │   ├── auth.ts                       # [DONE] /auth/*
│   │   │   ├── invitations.ts                # [DONE] /invitations/*
│   │   │   ├── tasks.ts                      # [DONE] /tasks/*
│   │   │   ├── memberships.ts                # [DONE] /memberships/*
│   │   │   ├── locations.ts                  # [DONE] /locations/* (REST only, Socket.IO pending)
│   │   │   └── messages.ts                   # [STUB] /messages/*
│   │   ├── controllers/
│   │   │   ├── index.ts                      # [DONE] Re-exports all controllers
│   │   │   ├── auth.ts                       # [DONE] signup/signin/signout/fetchMe
│   │   │   ├── invitations.ts                # [DONE] create/list/accept
│   │   │   ├── tasks.ts                      # [DONE] create/list/updateStatus/patch
│   │   │   ├── memberships.ts                # [DONE] getWorkerController
│   │   │   ├── locations.ts                  # [DONE] updateLocation, getLocations
│   │   │   └── messages.ts                   # [STUB]
│   │   └── services/
│   │       ├── index.ts                      # [DONE] Re-exports all services
│   │       ├── auth.ts                       # [DONE] signup/signin + password flows
│   │       ├── invitations.ts                # [DONE] create/accept/fetchInvitations
│   │       ├── tasks.ts                      # [DONE] create/list/updateStatus/patch
│   │       ├── memberships.ts                # [DONE] getWorkersService
│   │       ├── locations.ts                  # [DONE] updateLocation (Redis) + getLocations
│   │       └── messages.ts                   # [STUB]
│   ├── validations/
│   │   └── index.ts                          # [DONE] Centralized Zod schemas
│   ├── types/
│   │   └── index.ts                          # [DONE] IRoles type
│   ├── .env
│   ├── drizzle.config.ts
│   └── package.json
│
├── LATER.md                                  # Deferred features log
├── socket-server.ts                          # [TEST] Socket.IO practice — basic connect/disconnect only
└── README.md
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Next.js)                       │
│                                                             │
│  MANAGER                          WORKER                    │
│  /dashboard/* (sidebar)           / (bottom nav)           │
│   ├─ Tasks table + create         ├─ Task list + stats      │
│   ├─ Map (stub)                   ├─ /tasks/[id] detail    │
│   └─ Team / Chat (stub)           ├─ /chat-list + /chat    │
│                                   └─ /profile              │
│                                                             │
│  middleware.ts — cookie route guard (Edge Runtime)          │
│  AuthProvider — /auth/me on mount → user context           │
│  axios (withCredentials) + Sonner toasts                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST :8000
┌───────────────────────▼─────────────────────────────────────┐
│                   Server (Hono API)                         │
│  CORS → Routes → authMiddileware → requiredRoles            │
│  /auth  /invitations  /tasks  /memberships                  │
│  Services use Zod safeParse → structured error returns      │
└────────┬─────────────────────┬───────────────────────────────┘
         │                     │
┌────────▼──────┐  ┌───────────▼──────────────────────────────┐
│  PostgreSQL   │  │  Redis (Upstash)                          │
│  (Neon)       │  │  session:{hex64} → { userId, orgId, role}│
│  7 tables     │  │  TTL: 7 days                             │
└───────────────┘  └──────────────────────────────────────────┘
```

---

## Dual Interface Design

FieldForce has two completely separate UIs sharing the same API:

| | Manager | Worker |
|---|---|---|
| Entry point | `/dashboard` | `/` (root) |
| Navigation | Collapsible sidebar | Mobile bottom tab bar |
| Task view | Table with filter/search, create modal, edit panel | Card list with progress stats |
| Task detail | Edit panel (side-by-side) | Full-screen sheet with map |
| Maps | Google Maps in create modal (place autocomplete + pin) | Google Maps showing task location + navigate button |
| Chat | Stub page | Conversation list + chat UI (mock data) |
| Profile | — | Profile card + settings |

---

## Auth Strategy

FieldForce uses **Redis-backed session authentication** (no JWT tokens).

### Flow

```
POST /auth/signup or /auth/signin
  → Zod validate → DB query → bcrypt → create Redis session
  → set signed httpOnly cookie (7 days)
  → return { user, org/role }

GET request with cookie → authMiddileware
  → getSignedCookie → redis.get("session:{id}")
  → expired? delete cookie + 401
  → found? c.set("user", session) → next()

POST /auth/signout
  → redis.del("session:{id}") + deleteCookie
```

### Client-side guard

`client/middleware.ts` (Next.js Edge Runtime) checks cookie presence:
- No cookie on `/dashboard/*`, `/my-tasks`, `/team`, `/map`, `/chat` → redirect `/auth/signin?from=path`
- Cookie on `/auth/signin` or `/auth/signup` → redirect `/dashboard`

`AuthProvider` (`context/authContext.ts`) calls `GET /auth/me` on mount and stores full user object in React context.

### Role-based access

Server: `requiredRoles("manager")` middleware on manager-only routes.

Client: `<RoleGate allow={["manager"]}>` wraps UI elements — renders `null` (or fallback) if role doesn't match.

---

## Database Schema

Defined in [server/src/db/schema.ts](server/src/db/schema.ts).

**pgEnums:**
- `roleEnum` — `"manager" | "worker"`
- `invitationStatuses` — `"pending" | "accepted" | "declined"`

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, auto |
| `name` | VARCHAR(255) | |
| `email` | VARCHAR(255) | Unique |
| `password` | VARCHAR(255) | bcrypt hashed |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `organizations`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `name` | VARCHAR(255) | |
| `owner_id` | UUID | FK → users |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `memberships`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `organization_id` | UUID | FK → organizations |
| `role` | ENUM (`roleEnum`) | `manager` or `worker` |
| `joined_at` | TIMESTAMP | |

### `invitations`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations |
| `email` | VARCHAR(255) | |
| `token` | VARCHAR(255) | 64-char hex |
| `role` | ENUM (`roleEnum`) | Role on accept |
| `status` | ENUM (`invitationStatuses`) | Default `"pending"` |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations |
| `title` | VARCHAR(255) | |
| `description` | VARCHAR(1000) | |
| `creator_id` | UUID | FK → users (manager) |
| `assigned_to` | UUID | FK → users (nullable) |
| `status` | VARCHAR(50) | `pending` / `in_progress` / `completed` |
| `latitude` | INTEGER | Nullable |
| `longitude` | INTEGER | Nullable |
| `deadline` | INTEGER | Unix timestamp, nullable |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Relations defined:** `tasks.assignedWorker`, `tasks.creator`, `tasks.organization` (used in Drizzle relational queries)

### `locations`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `organization_id` | UUID | FK → organizations |
| `latitude` | INTEGER | |
| `longitude` | INTEGER | |
| `recorded_at` | TIMESTAMP | |

### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations |
| `sender_id` | UUID | FK → users |
| `receiver_id` | UUID | FK → users |
| `content` | VARCHAR(1000) | |
| `read_at` | TIMESTAMP | NULL until read |

---

## API Endpoints

Base path: `/api/v1`

### Health
| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/health` | None | **DONE** |

### Auth
| Method | Path | Auth | Status | Description |
|---|---|---|---|---|
| POST | `/auth/signup` | None | **DONE** | Register + org + session cookie |
| POST | `/auth/signin` | None | **DONE** | Login + session cookie |
| POST | `/auth/signout` | Cookie | **DONE** | Delete session + clear cookie |
| GET | `/auth/me` | Cookie | **DONE** | Current user from session |

### Invitations
| Method | Path | Auth | Role | Status | Description |
|---|---|---|---|---|---|
| POST | `/invitations/register` | Cookie | manager | **DONE** | Create invite + return link |
| GET | `/invitations/list` | Cookie | manager | **DONE** | List org invitations |
| POST | `/invitations/accept` | None | — | **DONE** | Accept → create user + session |
| POST | `/invitations/decline` | None | — | STUB | Decline invitation |

### Tasks
| Method | Path | Auth | Role | Status | Description |
|---|---|---|---|---|---|
| POST | `/tasks/register` | Cookie | manager | **DONE** | Create task (with optional assignee + location) |
| GET | `/tasks/list` | Cookie | any | **DONE** | List tasks — managers see all, workers see assigned |
| PATCH | `/tasks/:id/status` | Cookie | any | **DONE** | Update task status (workers: own tasks only) |
| PATCH | `/tasks/:id` | Cookie | manager | **DONE** | Full update — status + assignedTo together |

**Request body for `POST /tasks/register`:**
```json
{
  "title": "Meter Reading – Zone 4",
  "description": "Read electric meters on block D.",
  "assignedTo": "uuid-of-worker",
  "status": "pending",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "deadline": 1751234567
}
```

### Memberships
| Method | Path | Auth | Role | Status | Description |
|---|---|---|---|---|---|
| GET | `/memberships/workers` | Cookie | manager | **DONE** | List all workers in the org |

### Locations

| Method | Path | Auth | Role | Status | Description |
|---|---|---|---|---|---|
| POST | `/locations` | Cookie | any | **DONE** | Worker pushes GPS coordinates (stored in Redis) |
| GET | `/locations` | Cookie | manager | **DONE** | Manager gets latest location of all workers |
| GET | `/locations/:userId` | Cookie | manager | STUB | User location history from DB |

### Messages — `[STUB]`
| Method | Path | Description |
|---|---|---|
| POST | `/messages` | Send DM |
| GET | `/messages/:userId` | Get conversation |
| PATCH | `/messages/:id/read` | Mark as read |

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=8000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
REDIS_URL=rediss://user:pass@host:6380
SESSION_SECRET=your-long-random-secret

EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password
GOOGLE_MAPS_API_KEY=your-key

R2_ACCESS_KEY=key
R2_SECRET_KEY=secret
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_BUCKET=fieldforce
```

### Client (`client/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

---

## Getting Started

### Prerequisites

- Node.js 20+, pnpm 9+
- Neon PostgreSQL database
- Upstash Redis instance
- Google Maps API key (Maps JavaScript API + Places API enabled)

### Install & Run

```bash
# Server
cd server && cp .env.example .env
pnpm install && pnpm dev          # http://localhost:8000

# Client (new terminal)
cd client && cp .env.example .env
pnpm install && pnpm dev          # http://localhost:3000
```

### Database Migrations

```bash
cd server
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
pnpm drizzle-kit studio           # browser UI
```

---

## Module Breakdown

### Server Modules

---

#### `src/index.ts` — App Entry [DONE]

- CORS middleware with `CLIENT_ORIGIN` whitelist, `credentials: true`
- Routes: `/auth`, `/invitations`, `/tasks`, `/memberships`
- Global 404 handler via `notFoundError`
- Starts on `PORT`

---

#### `src/errors/index.ts` — Error Handlers [DONE]

Consistent JSON response shapes for every error type. All controllers use these.

| Function | Status | Shape |
|---|---|---|
| `serverError(c, err)` | 500 | `{ success, message, stack? }` |
| `badRequestError(c, { message, fields })` | 400 | `{ success, error: { message, code }, fields }` |
| `conflictError(c, { message, fields })` | 409 | same as above with code 409 |
| `notFoundError(c)` | 404 | `{ success, message }` |
| `authenticationError(c, message)` | 401 | `{ success, error: { message, code } }` |
| `authorizationError(c, message)` | 403 | same |
| `schemaValidationError(zodErr, msg)` | helper | Converts Zod issues → `{ message, fields[] }` |

---

#### `server/validations/index.ts` — Centralized Zod Schemas [DONE]

All Zod schemas live here (moved from individual service files).

| Schema | Used for |
|---|---|
| `ZUserSchema` / `TUser` | Signup |
| `ZSignin` / `ISignin` | Signin |
| `ZChangePassword` / `TChangePassword` | Password change |
| `ZForgotPassword` / `TForgotPassword` | Forgot password |
| `zPasswordReset` | Reset password |
| `zResetToken` | Token validation |
| `zTasks` | Task create/update |
| `BDPhoneRegex` | BD phone number validation |

---

#### `src/services/tasks.ts` — Task Service [DONE]

All functions validate input via `zTasks.safeParse` and return `{ error }` / `{ serverError }` / success.

**`taskCreateService({ user, body })`**
1. Zod validates body (title required, status enum, optional assignedTo/lat/lng/deadline)
2. If `assignedTo` provided → verifies that user is a worker in the same org
3. Inserts task with `organizationId` and `creatorId` from session
4. Returns created task

**`fetchTasksService({ user })`**
1. Manager → fetches all org tasks with relations (assignedWorker, creator, organization)
2. Worker → fetches only tasks where `assigned_to = userId`
3. Returns array of `ITask` with nested relations

**`updateTaskService({ user, taskId, body })`**
- Updates only `status` field
- Worker: can only update their own assigned task
- Manager: can update any task in org

**`patchTaskService({ user, taskId, body })`**
- Manager-only: updates both `status` and `assignedTo` atomically
- Validates new assignee is a worker in the org before updating

---

#### `src/services/memberships.ts` — Membership Service [DONE]

**`getWorkersService({ organizationId })`**
- Queries `memberships` joined with `users` where `role = "worker"` and `organizationId` matches
- Returns `[{ id, name, email, role }]` — used to populate assignee dropdowns on the client

---

#### `src/routes/tasks.ts` — Task Routes [DONE]

| Method | Path | Middleware | Handler |
|---|---|---|---|
| POST | `/register` | `authMiddileware`, `requiredRoles("manager")` | `tasksController` |
| GET | `/list` | `authMiddileware` | `fetchTasksController` |
| PATCH | `/:id/status` | `authMiddileware` | `taskUpdateController` |
| PATCH | `/:id` | `authMiddileware`, `requiredRoles("manager")` | `taskPatchController` |

---

#### `src/routes/memberships.ts` — Membership Routes [DONE]

| Method | Path | Middleware | Handler |
|---|---|---|---|
| GET | `/workers` | `authMiddileware`, `requiredRoles("manager")` | `getWorkerController` |

---

#### `src/services/auth.ts` — Auth Service [DONE]

**Exported:** `signupService`, `singinService`

**Defined but not yet exposed via routes:**
- `changePassword({ user, body })` — ZChangePassword validation, updates password in DB
- `forgotPassword(email)` — generates 128-char reset token, stores in in-memory Map, builds reset URL
- `resetPassword({ password, resetToken })` — validates token, hashes new password, updates DB, deletes token

---

#### `src/middleware/auth.ts` — Auth + RBAC [DONE]

**`authMiddileware`** — reads signed cookie → Redis session lookup → attaches user to context  
**`requiredRoles(...roles)`** — factory middleware, reads `c.get("user").role` → 403 if not allowed

---

### Client Modules

---

#### `context/authContext.ts` — Auth Context [DONE]

`AuthProvider` component:
- Calls `GET /auth/me` on mount to hydrate user state
- Provides `{ user, loading, refresh, logout }` to all children
- `user` shape: `{ userId, organizationId, role }`

`useUser()` hook — accesses context; throws if called outside `AuthProvider`.

```tsx
const { user, loading } = useUser()
// user.role === "manager" | "worker"
```

---

#### `interfaces/index.ts` — TypeScript Interfaces [DONE]

| Export | Description |
|---|---|
| `TaskStatus` | `"pending" \| "in_progress" \| "completed" \| "cancelled"` |
| `IWorker` | `{ id, name, email, role }` |
| `ICreator` | `{ id, name, email }` |
| `IOrganization` | `{ id, name }` |
| `ITask` | Full task with relations: `assignedWorker?: IWorker`, `creator: ICreator`, `organization: IOrganization` |

---

#### `middleware.ts` — Route Protection [DONE]

Next.js Edge Runtime. Checks `session` cookie presence.
- `/dashboard/*`, `/my-tasks`, `/team`, `/map`, `/chat` — protected, redirect to `/auth/signin?from=path`
- `/auth/signin`, `/auth/signup` — auth-only, redirect to `/dashboard` if already logged in

---

#### `components/providers.tsx` — Root Providers [DONE]

Wraps the entire app with:
1. `TooltipProvider` (Radix)
2. `ThemeProvider` (next-themes)
3. `AuthProvider` (auth context)
4. `Sonner` toaster (top-right, rich colors)

---

#### `components/roleGate.tsx` — RBAC Guard [DONE]

```tsx
<RoleGate allow={["manager"]} fallback={<p>No access</p>}>
  <ManagerOnlyContent />
</RoleGate>
```

Reads `useUser()`. Returns `null` (or `fallback`) if user's role is not in `allow`. Returns `null` during loading.

---

#### `components/google-maps-script.tsx` — Maps Loader [DONE]

Loads Google Maps JS API via Next.js `<Script>` (strategy: `afterInteractive`). On load, dispatches `"google-maps-loaded"` custom event so other components can safely initialize map instances.

---

#### `components/app-sidebar.tsx` — Manager Sidebar [DONE]

Sidebar structure for the manager dashboard. Uses `SidebarProvider` context.

Sections:
- **Header**: `TeamSwitcher` (org name + logo)
- **Main nav**: Dashboard, Maps, Tasks, Team, Chats (with icons)
- **Projects**: Empty array (placeholder)
- **Footer**: `NavUser` (user name + email)

Collapsed state shows icons only. Mobile: drawer with overlay.

---

#### `components/create-task-modal.tsx` — Create Task Modal [DONE]

Dialog modal for managers to create tasks. Fields:
- Title (required)
- Description
- Assignee — worker dropdown from `useWorkers()`
- Status — `pending / in_progress / completed`
- Deadline — date picker
- Location — Google Places autocomplete input + mini map with draggable marker pin + "Use current location" button (Geolocation API)

On submit: `POST /tasks/register` → calls `onCreated()` callback → closes modal.

---

#### `components/dashboard/manager-task-panel.tsx` — Task Edit Panel [DONE]

Right-side slide-in panel for managers editing a selected task. Backdrop dismissal.

- **Editable:** `status` (dropdown), `assignedTo` (worker dropdown from `useWorkers()`)
- **Read-only display:** description, deadline, location coords, creator name, created date
- Save → `PATCH /tasks/:id` with both fields
- Dirty state indicator when values have changed

---

#### `components/worker/bottom-navigation.tsx` — Mobile Tab Bar [DONE]

Fixed bottom navigation for workers (mobile-only). Three tabs:
- My Tasks → `/`
- Chat → `/chat-list` (with unread badge)
- Profile → `/profile`

Active tab highlighted. Icon + label per tab.

---

#### `components/worker/task-detail-sheet.tsx` — Task Detail Sheet [DONE]

Full-screen slide-up sheet (mobile) for workers viewing a task. Features:
- Sticky header with back button + task title
- `TaskMap` component if lat/lng present
- Status indicator + colored badge
- Task metadata: location address, deadline (with overdue warning), assigned by
- Description
- Action buttons:
  - Status progression: `pending → in_progress → completed`
  - "Navigate" → opens Google Maps directions URL

Uses `useUpdateTaskStatus` hook. Handles scroll lock on open.

---

#### `components/worker/task-map.tsx` — Task Map [DONE]

Google Maps component. Initializes `google.maps.Map` centered on `{ lat, lng }` with a marker. Listens for `"google-maps-loaded"` event if API not yet ready. Re-initializes on coordinate changes.

---

#### `app/page.tsx` — Worker Home [DONE]

Worker's primary task list screen (route: `/`). Features:
- Progress bar: completed / total tasks
- Stats row: done today, on-time %, this week
- Task cards: status badge, title, location, deadline (overdue warning)
- Loading skeleton while fetching
- Empty state when no tasks
- Tap a task card → opens `TaskDetailSheet`

Uses `useTasks()` hook.

---

#### `app/dashboard/layout.tsx` — Dashboard Layout [DONE]

Wraps all `/dashboard/*` pages with `SidebarProvider` → `AppSidebar` + `SidebarInset` (main content area). Provides the sidebar context for collapsible behavior.

---

#### `app/dashboard/page.tsx` — Manager Dashboard Home [DONE]

Manager's dashboard overview. Breadcrumb navigation header. Grid of placeholder cards (future: analytics, stats, quick actions).

---

#### `app/dashboard/tasks/page.tsx` — Manager Task Page [DONE]

Full task management interface for managers:
- **Filter bar**: status tabs (All / Pending / In Progress / Completed) + title search input
- **Task table**: assignee avatar + name, status badge, lat/lng, deadline (overdue indicator), created date
- **Create button** → opens `CreateTaskModal`
- **Row click** → opens `ManagerTaskPanel` (right-side edit panel)
- Loading skeleton and empty state

Uses `useTasks()`, `useWorkers()`, `CreateTaskModal`, `ManagerTaskPanel`.

---

#### `app/tasks/[id]/page.tsx` — Worker Task Detail Page [DONE]

Dedicated page for a single task. Fetches task by `id` param from `useTasks()`. Shows:
- Sticky header with back navigation
- `TaskMap` if coordinates exist
- Status badge
- Title, meta (location, deadline, assigned by), description
- Action buttons (status update, Google Maps navigate)
- Loading and not-found states

---

#### `app/chat-list/page.tsx` — Worker Chat List [DONE]

Conversation list for workers. Displays list of conversations with:
- Initials avatar
- Name + last message preview
- Timestamp
- Unread indicator dot

Currently hardcoded mock data. Links each conversation to `/chat?id=...`.

---

#### `app/chat/page.tsx` — Worker Chat [DONE]

Chat interface with:
- Desktop: sidebar (conversation list) + main chat area
- Mobile: chat area only
- Message history with sender/receiver differentiation and timestamps
- Send message form (local state only, not connected to backend)

Hardcoded mock data. Real-time backend pending.

---

#### `app/profile/page.tsx` — Worker Profile [DONE]

Worker profile screen:
- Profile card: avatar, name, role badge, availability toggle
- Stats: tasks done today, on-time %, this week
- Settings list: Availability toggle, Notifications, Vehicle & equipment, Help & support, Sign out

All UI only — settings not wired to API.

---

#### `hooks/dashboard/tasks/useTasks.ts` — Task List Hook [DONE]

```ts
const { tasks, setTasks, loading, refresh } = useTasks()
```

Calls `GET /tasks/list` on mount. Returns task array, manual setter (for optimistic updates), loading flag, and `refresh()` to re-fetch.

---

#### `hooks/useUpdateTaskStatus.ts` — Status Update Hook [DONE]

```ts
const updated = await updateStatus(taskId, "in_progress")
```

Calls `PATCH /tasks/:id/status`. Returns updated `ITask` or `null`. Loading state + success/error toasts.

---

#### `hooks/useWorkers.ts` — Worker List Hook [DONE]

```ts
const { workers, loading } = useWorkers()
```

Calls `GET /memberships/workers`. Returns `IWorker[]` for populating assignee dropdowns in manager views.

---

#### `hooks/use-mobile.ts` — Mobile Detection [DONE]

```ts
const isMobile = useIsMobile()  // true if < 768px
```

Uses `window.matchMedia("(max-width: 768px)")` with resize listener.

---

#### `validations/zod.ts` — Client Zod Schemas [DONE]

| Schema | Fields |
|---|---|
| `signupSchema` | `name` (≥2), `email`, `organizationName` (≥2), `password` (6–20) |
| `singinSchema` | `email`, `password` (6–20) |
| `zTasks` | `title`, `description`, `assignedTo?`, `status` (enum), `latitude?`, `longitude?`, `deadline?` |

---

## Implementation Status

### Done

- [x] PostgreSQL + Drizzle schema (7 tables + 2 pgEnums + task relations)
- [x] Redis session management
- [x] Centralized error handler (`errors/index.ts`)
- [x] Centralized Zod schemas (`server/validations/index.ts`)
- [x] Auth — signup, signin, signout, me
- [x] Auth middleware + RBAC (`requiredRoles`)
- [x] Auth context (`AuthProvider` + `useUser`)
- [x] Invitations — create, list, accept
- [x] **Tasks — create** (manager, with optional assignee + location)
- [x] **Tasks — list** (role-filtered: manager sees all, worker sees assigned)
- [x] **Tasks — update status** (worker updates own, manager updates any)
- [x] **Tasks — full patch** (manager updates status + assignedTo together)
- [x] **Memberships — list workers** (`GET /memberships/workers`)
- [x] **Locations — update** (`POST /locations`) — stores `{ lat, lng, updatedAt }` in Redis (`location:{orgId}:{userId}`, TTL 1hr)
- [x] **Locations — get all** (`GET /locations`) — manager fetches latest position of all workers via Redis `MGET`
- [x] Socket.IO basic connection test (server: connect/disconnect logs; client: `test.tsx` probe component — **practice only, no real events yet**)
- [x] Next.js route protection middleware
- [x] `RoleGate` component (client-side RBAC guard)
- [x] Google Maps integration (loader, location picker, task map, navigate)
- [x] Manager dashboard with sidebar navigation
- [x] Manager task table (filter by status, search by title)
- [x] `CreateTaskModal` — full form with Google Maps + Places autocomplete
- [x] `ManagerTaskPanel` — slide-in edit panel (status + assignee)
- [x] Worker home page — task list with progress + stats
- [x] Worker task detail — map + status progression + navigate
- [x] Worker chat UI — list + chat interface (mock data, backend pending)
- [x] Worker profile page (UI only)
- [x] Worker bottom navigation
- [x] `useTasks`, `useWorkers`, `useUpdateTaskStatus`, `useIsMobile` hooks
- [x] TypeScript interfaces (`ITask`, `IWorker`, `TaskStatus`, etc.)
- [x] Tailwind CSS v4 + full shadcn/ui component set

### Stub / Pending

- [ ] Invitation decline endpoint
- [ ] Email sending for invitations
- [ ] `changePassword`, `forgotPassword`, `resetPassword` — defined, not exposed via routes
- [ ] Dashboard map page (real-time worker locations)
- [ ] Dashboard team page
- [ ] Dashboard chat page (manager side)
- [ ] Worker profile settings wired to API
- [ ] `requireRole.ts` — can be deleted (superseded)
- [ ] `src/lib/auth-utils.ts` — can be deleted (superseded)

### Not Started

- [ ] Socket.IO real-time events (connection test done — actual `location:update` / `message:send` events pending)
- [ ] Location history from DB (current: latest position only via Redis)
- [ ] Messages endpoints + real-time delivery
- [ ] Google Maps live tracking (markers for all workers, Socket.IO updates)
- [ ] File uploads (Cloudflare R2)
- [ ] Email service (Gmail SMTP for invitations)

---

## Roadmap

| Week | Feature | Status |
|---|---|---|
| 1 | Project setup (server + client + DB schema) | Done |
| 2 | Auth (signup, signin, signout, session, Zod) | Done |
| 3 | Invitations + Tasks CRUD + Worker/Manager UI | Done |
| 4 | Real-time location (Socket.IO events + Google Maps live tracking) | In Progress |
| 5 | Real-time chat (DMs, read receipts, Socket.IO) | Pending |
| 6 | Dashboard analytics + notifications | Pending |
| 7–13 | Polish, testing, deployment, extras | Pending |
