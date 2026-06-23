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
- [Socket.IO Events](#socketio-events)
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
| Cache / Session | Redis (Upstash) via ioredis | 5.11.1 | Session store, live location cache |
| Password Hashing | bcrypt | — | Secure password hashing |
| HTTP Client | axios | — | API calls with cookie support |
| Maps | Google Maps JavaScript API | — | Location picker, live map, navigation |
| Toast | Sonner | — | Toast notifications |
| Real-time | Socket.IO | — | Live location + chat |
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
│   │   │   ├── layout.tsx                    # [DONE] Sidebar layout (persists open/closed state)
│   │   │   ├── page.tsx                      # [DONE] Manager dashboard home
│   │   │   ├── tasks/page.tsx                # [DONE] Task table + filter + search + create + edit panel
│   │   │   ├── maps/page.tsx                 # [DONE] Live map — workers + tasks + Socket.IO
│   │   │   ├── chats/page.tsx                # [DONE] Manager chat — ConversationList + MessageThread
│   │   │   ├── test.tsx                      # [PRACTICE] Socket.IO connection test (dev only)
│   │   │   └── team/page.tsx                 # [STUB] Team management page
│   │   ├── chats/page.tsx                    # [DONE] Worker chat — ConversationList + MessageThread (mobile)
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
│   │   ├── chat/
│   │   │   ├── conversation-list.tsx         # [DONE] Shared conversation list (manager + worker)
│   │   │   └── message-thread.tsx            # [DONE] Shared message thread (manager + worker)
│   │   ├── dashboard/
│   │   │   ├── manager-task-panel.tsx        # [DONE] Task edit side panel
│   │   │   └── map/
│   │   │       ├── live-map.tsx              # [DONE] Google Maps live worker + task markers
│   │   │       └── worker-list-sidebar.tsx   # [DONE] Worker list with online/offline filter
│   │   ├── worker/
│   │   │   ├── bottom-navigation.tsx         # [DONE] Mobile tab bar
│   │   │   ├── task-detail-sheet.tsx         # [DONE] Full-screen task detail
│   │   │   └── task-map.tsx                  # [DONE] Google Maps task map
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
│   │   ├── chat-service.ts                   # [DONE] Chat types + mock service functions
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
│   │   ├── index.ts                          # [DONE] Entry — CORS + routes + Socket.IO (auth + location events)
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
│   │   │   └── auth.ts                       # [DONE] authMiddileware + requiredRoles
│   │   ├── routes/
│   │   │   ├── auth.ts                       # [DONE] /auth/*
│   │   │   ├── invitations.ts                # [DONE] /invitations/*
│   │   │   ├── tasks.ts                      # [DONE] /tasks/*
│   │   │   ├── memberships.ts                # [DONE] /memberships/*
│   │   │   ├── locations.ts                  # [DONE] /locations/*
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
│   ├─ /dashboard/maps              ├─ /tasks/[id] detail    │
│   │   WorkerListSidebar +         ├─ /chats (mobile)       │
│   │   LiveMap + Socket.IO         └─ /profile              │
│   └─ /dashboard/chats                                       │
│       ConversationList + MessageThread                      │
│                                                             │
│  middleware.ts — cookie route guard (Edge Runtime)          │
│  AuthProvider — /auth/me on mount → user context           │
│  axios (withCredentials) + Sonner toasts                   │
└───────────────┬────────────────────────┬────────────────────┘
                │ REST :8000             │ Socket.IO :8000
┌───────────────▼────────────────────────▼────────────────────┐
│                   Server (Hono + Socket.IO)                 │
│  CORS → Routes → authMiddileware → requiredRoles            │
│  /auth  /invitations  /tasks  /memberships  /locations      │
│                                                             │
│  Socket.IO middleware — validates session cookie → join     │
│  org:{organizationId} room                                  │
│  "location-update" → Redis SET + broadcast "worker-location"│
└────────┬─────────────────────┬───────────────────────────────┘
         │                     │
┌────────▼──────┐  ┌───────────▼──────────────────────────────┐
│  PostgreSQL   │  │  Redis (Upstash)                          │
│  (Neon)       │  │  session:{hex64} → { userId, orgId, role}│
│  7 tables     │  │  location:{orgId}:{userId} → { lat, lng }│
│               │  │  TTL: session 7d / location 1h           │
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
| Maps | `/dashboard/maps` — live worker + task markers, worker sidebar | Task map in detail sheet + navigate button |
| Chat | `/dashboard/chats` — ConversationList + MessageThread (desktop layout) | `/chats` — same components, mobile-first (list → thread navigation) |
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

### Messages — `[STUB]`
| Method | Path | Description |
|---|---|---|
| POST | `/messages` | Send DM |
| GET | `/messages/:userId` | Get conversation |
| PATCH | `/messages/:id/read` | Mark as read |

---

## Socket.IO Events

All Socket.IO connections are authenticated via session cookie. On connect, each client joins `org:{organizationId}` room.

### Client → Server

| Event | Sender | Payload | Description |
|---|---|---|---|
| `location-update` | worker | `{ latitude, longitude }` | Worker pushes GPS position; server writes to Redis and broadcasts to org room |

### Server → Client

| Event | Receiver | Payload | Description |
|---|---|---|---|
| `worker-location` | manager (in org room) | `{ userId, latitude, longitude, updatedAt }` | Broadcast on every worker location update |

### Planned (not yet implemented)

| Event | Direction | Description |
|---|---|---|
| `chat:message` | server → client | New message delivered in real time |
| `chat:read` | client → server | Mark conversation as read |
| `chat:typing` | client → server | Typing indicator |

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
- Routes: `/auth`, `/invitations`, `/tasks`, `/memberships`, `/locations`
- Global 404 handler via `notFoundError`
- **Socket.IO server** attached to the same Node.js HTTP server:
  - Auth middleware: parses signed `session` cookie from handshake headers → validates Redis session → attaches `socket.data.user`
  - On connect: worker/manager joins `org:{organizationId}` room
  - `"location-update"` event: worker-only; writes to Redis via `updateLocationService` and broadcasts `"worker-location"` to org room

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

**`fetchTasksService({ user })`**
1. Manager → fetches all org tasks with relations (assignedWorker, creator, organization)
2. Worker → fetches only tasks where `assigned_to = userId`

**`updateTaskService({ user, taskId, body })`**
- Updates only `status` field
- Worker: can only update their own assigned task

**`patchTaskService({ user, taskId, body })`**
- Manager-only: updates both `status` and `assignedTo` atomically
- Validates new assignee is a worker in the org before updating

---

#### `src/services/locations.ts` — Location Service [DONE]

**`updateLocationService({ organizationId, userId, latitude, longitude })`**
- Writes `{ userId, lat, lng, updatedAt }` to Redis key `location:{orgId}:{userId}` with TTL 1hr
- Also called by Socket.IO `"location-update"` handler directly (bypassing HTTP)

**`getLocationsService(organizationId)`**
- `KEYS location:{orgId}:*` → `MGET` → parse all → returns array of location objects

---

#### `src/services/memberships.ts` — Membership Service [DONE]

**`getWorkersService({ organizationId })`**
- Queries `memberships` joined with `users` where `role = "worker"`
- Returns `[{ id, name, email, role }]`

---

#### `src/middleware/auth.ts` — Auth + RBAC [DONE]

**`authMiddileware`** — reads signed cookie → Redis session lookup → attaches user to context  
**`requiredRoles(...roles)`** — factory middleware, reads `c.get("user").role` → 403 if not allowed

---

### Client Modules

---

#### `lib/chat-service.ts` — Chat Service [DONE]

Typed service layer for chat. All functions are async and currently return mock data. Each has a TODO comment showing the real API call to substitute when the backend is ready.

**Types:**
- `ChatMessage` — `{ id, conversationId, senderId, senderName, content, timestamp, status }`
- `Conversation` — `{ id, type, name, participantId?, isOnline?, lastMessage, lastMessageAt, unreadCount }`

**Functions:**
- `getConversations(role)` — returns manager or worker conversation list
- `getMessages(conversationId)` — returns message history for a conversation
- `sendMessage(conversationId, senderName, content)` — pushes message to local store, returns new `ChatMessage`
- `markAsRead(conversationId)` — no-op stub (TODO: `POST /conversations/:id/read`)

**Socket events to wire up (documented in service file):**
- `"chat:message"` → `{ conversationId, message: ChatMessage }`
- `"chat:read"` → `{ conversationId, userId }`
- `"chat:typing"` → `{ conversationId, userId, typing: boolean }`

---

#### `components/chat/conversation-list.tsx` — Conversation List [DONE]

Shared between manager and worker chat pages.

- 300px fixed-width sidebar column
- Name-based color avatar (deterministic palette) with online dot for direct chats
- Group conversations show a `Users` icon
- Search input filters by conversation name
- Unread count badge
- `headerLeft` slot — used by manager page to inject `SidebarTrigger`
- Selected conversation highlighted with blue left border

---

#### `components/chat/message-thread.tsx` — Message Thread [DONE]

Shared between manager and worker chat pages.

- Groups messages by calendar day with date separators ("Today", "Yesterday", date)
- Sent bubbles (blue, right-aligned) vs received bubbles (gray, left-aligned)
- Message status icons: `Check` = sent, `CheckCheck` = delivered, `CheckCheck` white = read
- Group chats: sender name label above first bubble in a run, avatar on last bubble
- `onBack` prop (optional) — shows `ChevronLeft` button for mobile list→thread navigation
- Auto-scrolls to bottom on new messages via `ref`
- Empty state when no conversation selected

---

#### `app/dashboard/chats/page.tsx` — Manager Chat Page [DONE]

Desktop chat layout. `ConversationList` + `MessageThread` side by side. `SidebarTrigger` injected via `headerLeft` slot. Loads manager conversations on mount. Selecting a conversation loads messages and clears unread count.

---

#### `app/chats/page.tsx` — Worker Chat Page [DONE]

Mobile-first chat layout. On mobile: shows list OR thread (not both). On desktop: side by side.

- `showThread` flag controls which panel is visible on mobile
- `onBack` → returns to conversation list
- Loads worker conversations (subset: manager DM + crew group) on mount

---

#### `components/dashboard/map/live-map.tsx` — Live Map [DONE]

Google Maps component for the manager's live map page.

**Worker markers** — custom SVG:
- Colored circle with initials (color determined by name, teal border if online, gray if offline)
- First-name pill label below the circle
- Click → fires `onWorkerClick(workerId)`

**Task markers** — teardrop pin:
- Color by status: `pending` = blue, `in_progress` = orange, `completed` = green, `cancelled` = red

**InfoWindow** — opens on worker marker click:
- Shows avatar, name, online/offline status
- Current task reference (e.g. `FF-A3B2`) + title if assigned
- "Message" and "Assign task" buttons (UI only)

**Pan + zoom** — when `selectedWorkerId` changes, map pans to that worker and zooms to 15

**Legend** — bottom-left overlay listing task pin colors

---

#### `components/dashboard/map/worker-list-sidebar.tsx` — Worker List Sidebar [DONE]

Left panel on the maps page.

- Live count chip in header (online workers)
- Search by name or email
- Filter tabs: All / Online / Offline with per-tab counts
- Each row: avatar + name + status line (current task title if online+busy, "no active task" if online+idle, "Offline · Xm ago" if offline)
- Crosshair "Locate" button per row → calls `onLocate(workerId)` to pan map

---

#### `app/dashboard/maps/page.tsx` — Live Map Page [DONE]

Manager-only page at `/dashboard/maps`.

1. Fetches workers (`GET /memberships/workers`), locations (`GET /locations`), tasks (`GET /tasks/list`) in parallel via `Promise.allSettled`
2. Merges into `WorkerWithLocation[]` — worker is "online" if last location update < 5 minutes ago; current task is the first `pending` or `in_progress` task assigned to them
3. Socket.IO connection: subscribes to `"worker-location"` events, updates `locationMap` state in real time → triggers re-render of markers
4. `selectedWorkerId` state — shared between sidebar click, locate button, and map marker click
5. Role guard: renders "only available to managers" if a worker somehow reaches this page

---

#### `context/authContext.ts` — Auth Context [DONE]

`AuthProvider` component:
- Calls `GET /auth/me` on mount to hydrate user state
- Provides `{ user, loading, refresh, logout }` to all children
- `user` shape: `{ userId, name, email, organizationId, role }`

`useUser()` hook — accesses context; throws if called outside `AuthProvider`.

---

#### `components/app-sidebar.tsx` — Manager Sidebar [DONE]

Nav items: Dashboard (`/dashboard`), Maps (`/dashboard/maps`), Tasks (`/dashboard/tasks`), Team (`/dashboard/team`), Chats (`/dashboard/chats`), Settings (`/dashboard/settings`).

Collapsed state shows icons only. Mobile: drawer with overlay.

---

#### `app/dashboard/layout.tsx` — Dashboard Layout [DONE]

Wraps all `/dashboard/*` pages with `SidebarProvider` → `AppSidebar` + `SidebarInset`. Reads `sidebar_state` cookie server-side to persist the user's last open/closed preference across page loads.

---

#### `app/dashboard/tasks/page.tsx` — Manager Task Page [DONE]

Full task management interface for managers:
- **Filter tabs**: All / Pending / In Progress / Completed (with counts)
- **Search**: title search input in the header
- **Task table**: assignee avatar + name, status dot + label, lat/lng coords, deadline (red if overdue)
- **Create button** → opens `CreateTaskModal`
- **Row click** → opens `ManagerTaskPanel` (right-side edit panel)

---

#### `components/create-task-modal.tsx` — Create Task Modal [DONE]

Dialog modal for managers to create tasks. Fields:
- Title (required)
- Description
- Assignee — worker dropdown from `useWorkers()`
- Status — `pending / in_progress / completed`
- Deadline — date picker
- Location — Google Places autocomplete input + mini map with draggable marker pin + "Use current location" button

On submit: `POST /tasks/register` → calls `onCreated()` callback → closes modal.

---

#### `components/dashboard/manager-task-panel.tsx` — Task Edit Panel [DONE]

Right-side slide-in panel for managers editing a selected task.

- **Editable:** `status` (dropdown), `assignedTo` (worker dropdown)
- **Read-only:** description, deadline, location coords, creator name, created date
- Save → `PATCH /tasks/:id` with both fields
- Dirty state indicator when values have changed

---

#### `components/worker/task-detail-sheet.tsx` — Task Detail Sheet [DONE]

Full-screen slide-up sheet (mobile) for workers viewing a task:
- `TaskMap` if lat/lng present
- Status indicator + colored badge
- Task metadata: location, deadline (with overdue warning), assigned by
- Status progression: `pending → in_progress → completed`
- "Navigate" → opens Google Maps directions URL

---

#### `app/page.tsx` — Worker Home [DONE]

Worker's primary task list screen (`/`):
- Progress bar: completed / total tasks
- Stats row: done today, on-time %, this week
- Task cards with status badge, location, deadline (overdue warning)
- Loading skeleton + empty state
- Tap a task card → opens `TaskDetailSheet`

---

#### `middleware.ts` — Route Protection [DONE]

Next.js Edge Runtime. Checks `session` cookie presence.
- `/dashboard/*`, `/my-tasks`, `/team`, `/map`, `/chat` — protected
- `/auth/signin`, `/auth/signup` — redirect to `/dashboard` if already logged in

---

#### `hooks/dashboard/tasks/useTasks.ts` — Task List Hook [DONE]

```ts
const { tasks, setTasks, loading, refresh } = useTasks()
```

Calls `GET /tasks/list` on mount. Returns task array, manual setter (for optimistic updates), loading flag, and `refresh()`.

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

Calls `GET /memberships/workers`. Returns `IWorker[]` for assignee dropdowns.

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
- [x] Tasks — create, list, update status, full patch
- [x] Memberships — list workers
- [x] Locations REST — `POST /locations` + `GET /locations` (Redis-backed, TTL 1hr)
- [x] **Socket.IO — real location events**: server auth middleware (session cookie), org rooms, `"location-update"` → Redis + broadcast `"worker-location"`
- [x] **Live map page** — `WorkerListSidebar` + `LiveMap` + Socket.IO client subscription
- [x] **Chat system** — shared `ConversationList` + `MessageThread` components, `chat-service.ts` typed mock layer
- [x] **Manager chat page** (`/dashboard/chats`) — desktop layout
- [x] **Worker chat page** (`/chats`) — mobile-first (list/thread toggle)
- [x] Next.js route protection middleware
- [x] `RoleGate` component (client-side RBAC guard)
- [x] Google Maps — loader, location picker, live map markers, task map, navigate
- [x] Manager sidebar — all nav links wired to correct routes
- [x] Manager task table — filter by status, search by title, create modal, edit panel
- [x] Worker home page — task list with progress + stats
- [x] Worker task detail — map + status progression + navigate
- [x] Worker profile page (UI only)
- [x] Worker bottom navigation
- [x] `useTasks`, `useWorkers`, `useUpdateTaskStatus`, `useIsMobile` hooks
- [x] TypeScript interfaces (`ITask`, `IWorker`, `TaskStatus`, etc.)
- [x] Tailwind CSS v4 + full shadcn/ui component set

### Stub / Pending

- [ ] Invitation decline endpoint
- [ ] Email sending for invitations
- [ ] `changePassword`, `forgotPassword`, `resetPassword` — defined, not exposed via routes
- [ ] Dashboard team page
- [ ] Worker profile settings wired to API
- [ ] Chat backend — real `GET /conversations`, `POST /conversations/:id/messages`
- [ ] Socket.IO chat events (`chat:message`, `chat:read`, `chat:typing`)

### Not Started

- [ ] Location history from DB (current: latest position only via Redis)
- [ ] File uploads (Cloudflare R2)
- [ ] Email service (Gmail SMTP for invitations)
- [ ] Dashboard analytics / notifications
- [ ] Query / search / filter / pagination on task endpoints (see `LATER.md`)

---

## Roadmap

| Week | Feature | Status |
|---|---|---|
| 1 | Project setup (server + client + DB schema) | Done |
| 2 | Auth (signup, signin, signout, session, Zod) | Done |
| 3 | Invitations + Tasks CRUD + Worker/Manager UI | Done |
| 4 | Real-time location (Socket.IO + Google Maps live tracking) | Done |
| 5 | Real-time chat (DMs, read receipts, Socket.IO) | In Progress |
| 6 | Dashboard analytics + notifications | Pending |
| 7–13 | Polish, testing, deployment, extras | Pending |
