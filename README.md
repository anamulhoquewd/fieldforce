# FieldForce

FieldForce is a multi-tenant SaaS app for managing field teams. Managers can invite workers, assign tasks, track live worker locations on Google Maps, and chat with workers in real time. Workers get a role-focused dashboard, mobile navigation, task list/detail views, location sharing, and direct chat with their manager.

> Work in progress - this README reflects the current `week-6` branch.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js App Router, React, TypeScript | Client app, routing, layouts |
| UI | Tailwind CSS v4, shadcn/ui, lucide-react, Recharts | Design system, icons, charts |
| Forms | React Hook Form, Zod | Form state and validation |
| State | React Context | Auth state and shared Socket.IO connection |
| Backend | Hono on Node via `@hono/node-server` | REST API |
| Database | PostgreSQL, Drizzle ORM | Persistent data and typed queries |
| Cache / Session | Redis via ioredis | Sessions and latest worker location cache |
| Realtime | Socket.IO | Chat messages and worker location broadcasts |
| Maps | Google Maps JavaScript API | Location picking, worker map, task navigation |
| Toasts | Sonner | Client notifications |

---

## Project Structure

```txt
fieldforce/
|-- client/
|   |-- app/
|   |   |-- auth/
|   |   |   |-- signin/page.tsx
|   |   |   `-- signup/page.tsx
|   |   |-- dashboard/
|   |   |   |-- chats/page.tsx
|   |   |   |-- maps/page.tsx
|   |   |   |-- page.tsx
|   |   |   |-- profile/page.tsx
|   |   |   |-- tasks/page.tsx
|   |   |   `-- team/page.tsx
|   |   |-- chats/page.tsx
|   |   |-- join/page.tsx
|   |   |-- profile/page.tsx
|   |   |-- tasks/page.tsx
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   |-- chat/
|   |   |-- dashboard/
|   |   |-- profile/
|   |   |-- team/
|   |   |-- ui/
|   |   |-- worker/
|   |   |-- app-shell.tsx
|   |   `-- app-sidebar.tsx
|   |-- context/
|   |   |-- authContext.ts
|   |   `-- socketContext.tsx
|   |-- hooks/
|   |   |-- auth/
|   |   |-- chat/
|   |   `-- dashboard/
|   |-- lib/
|   |   |-- api.ts
|   |   |-- auth-role.ts
|   |   |-- dashboard-data.ts
|   |   `-- utils.ts
|   |-- proxy.ts
|   `-- validations/zod.ts
|-- server/
|   |-- src/
|   |   |-- controllers/
|   |   |-- db/
|   |   |-- errors/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- validations/
|   |   `-- index.ts
|   `-- drizzle.config.ts
|-- LATER.md
`-- README.md
```

---

## Architecture Overview

The app now uses one shared shell for both roles.

Managers use `/dashboard/*` routes:

- `/dashboard` - organization task overview with stats, charts, worker status, and recent tasks.
- `/dashboard/tasks` - task table with filters, search, create modal, and edit side panel.
- `/dashboard/maps` - live worker map with worker sidebar and task markers.
- `/dashboard/team` - member table, role filtering, search, invite modal, and pending invitations.
- `/dashboard/chats` - direct messages with workers.
- `/dashboard/profile` - manager profile page.

Workers use root app routes:

- `/` - worker dashboard with task stats, charts, filtered task preview, and chat preview.
- `/tasks` - full worker task list with geolocation sharing and task detail sheet.
- `/chats` - direct message thread with the manager.
- `/profile` - worker profile page.

`client/components/app-shell.tsx` renders the shared sidebar and adds the worker bottom navigation for workers. Auth pages and `/join` bypass the shell.

`client/proxy.ts` replaces the old middleware file. It protects app routes, redirects unauthenticated users to `/auth/signin`, redirects signed-in users away from auth pages, and uses the `ff_role` cookie to send managers and workers to the correct home/profile routes.

---

## Auth And Role Routing

- Session auth is backed by Redis and a signed `session` cookie.
- `AuthProvider` hydrates the current user from `GET /auth/me`.
- `lib/auth-role.ts` stores a lightweight `ff_role` cookie after signin or invitation acceptance.
- `getRoleHome("manager")` returns `/dashboard`; `getRoleHome("worker")` returns `/`.
- Signout clears the role cookie and redirects to `/auth/signin`.

Server-side RBAC lives in `server/src/middleware/auth.ts`:

- `authMiddileware` validates the session and attaches the user to the Hono context.
- `requiredRoles(...roles)` blocks routes that require a specific role.

---

## API Endpoints

All REST endpoints are mounted under `/api/v1`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/signup` | Public | Create organization and manager |
| POST | `/auth/signin` | Public | Sign in and create session |
| POST | `/auth/signout` | Public | Clear session |
| GET | `/auth/me` | Any user | Fetch current user |
| POST | `/invitations/register` | Manager | Create worker invitation |
| GET | `/invitations` | Manager | List organization invitations |
| POST | `/invitations/accept` | Public | Accept invitation and create worker account |
| POST | `/tasks/register` | Manager | Create task |
| GET | `/tasks/list` | Any user | List tasks scoped to role/org |
| PATCH | `/tasks/:id/status` | Any user | Update task status |
| PATCH | `/tasks/:id` | Manager | Patch task assignment/status |
| GET | `/memberships?type=all\|manager\|worker` | Any user | List memberships by role filter |
| POST | `/locations` | Any user | Update latest location |
| GET | `/locations` | Manager | Get latest worker locations from Redis |
| GET | `/messages/:userId` | Any user | Get one-to-one message history |

---

## Socket.IO Events

The Socket.IO server authenticates using the signed `session` cookie. On connect, each client joins `org:{organizationId}` and `user:{userId}` rooms.

| Event | Direction | Purpose |
|---|---|---|
| `send-message` | Client -> server | Persist a direct message and emit it to both participants |
| `new-message` | Server -> client | Deliver a persisted chat message |
| `location-update` | Worker -> server | Write latest location to Redis and broadcast to the organization |
| `worker-location` | Server -> manager clients | Push latest worker coordinates to live maps and dashboards |

Dedicated typing, read receipt, and explicit presence events are not implemented yet.

---

## Week 6 Highlights

- Added a shared `AppShell` so manager and worker pages use one sidebar system.
- Added role-aware route proxying with manager/worker home and profile redirects.
- Reworked worker navigation: worker dashboard at `/`, full tasks at `/tasks`, chat at `/chats`, profile at `/profile`.
- Removed the old mock `chat-list` route and the old `tasks/[id]` page in favor of a full task list plus `TaskDetailSheet`.
- Added worker dashboard analytics with stat cards, task charts, filtered task previews, and a chat preview.
- Added manager dashboard overview components: stat cards, task status chart, recent task table, and worker status list.
- Refactored chat pages into `useManagerChat` and `useWorkerChat` hooks using the shared socket context.
- Added `useMapData` to centralize worker, task, location, and realtime map data loading.
- Expanded team management with a member table, role filters, search, invitation modal, and pending invitation list.
- Added the `/join` invitation acceptance page and role-cookie routing after accepting an invite.
- Added UI primitives used by the new screens: dialog, alert dialog, badge, chart, empty, field, input group, scroll area, table, textarea, spinner, and message components.

---

## Environment Variables

### Client

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
BACKEND_URL=https://your-backend.example.com
```

`BACKEND_URL` is used by `next.config.ts` rewrites in production so `/api/v1/*` and `/socket.io/*` can be proxied through the frontend host.

### Server

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SESSION_SECRET=replace_me
```

---

## Getting Started

Install dependencies separately in both apps:

```bash
cd server
pnpm install

cd ../client
pnpm install
```

Run the backend:

```bash
cd server
pnpm dev
```

Run the frontend:

```bash
cd client
pnpm dev
```

Typical local URLs:

- Frontend: `http://localhost:3001` or the port Next.js prints.
- Backend REST: `http://localhost:3000/api/v1`.
- Socket.IO: `http://localhost:3000/socket.io`.

---

## Implementation Status

### Done

- PostgreSQL + Drizzle schema for users, organizations, memberships, invitations, tasks, locations, and messages.
- Redis-backed sessions and latest-location storage.
- Auth: signup, signin, signout, current-user hydration.
- Hono auth middleware and role guards.
- Shared auth context and shared Socket.IO context.
- Role-aware route protection and redirects through `client/proxy.ts`.
- Manager and worker shell navigation from one `AppShell`.
- Invitations: create/list/accept flow at API level.
- Team page UI with member list, search, role filters, invite modal, and pending invitations display.
- Tasks: create, list, update status, manager patch assignment/status.
- Manager task table, create modal, and edit panel.
- Worker dashboard, worker task list, task detail sheet, task map, and status updates.
- Latest worker locations through REST and Socket.IO.
- Manager live map with worker markers, task markers, locate flow, and live updates.
- Direct manager-worker chat with DB history and Socket.IO send/receive.
- Manager dashboard overview with stats, charts, worker status list, and recent task table.
- Worker profile and manager profile pages.
- shadcn/ui component set expanded for week-6 screens.

### Pending / Known Gaps

- `/join` currently imports `@/hooks/auth/acceptInvitation`, but that hook is not present in the current tree. The acceptance logic exists in `hooks/dashboard/team/useInvitation.ts`; extract or add the missing auth hook before relying on `/join`.
- Invitation resend/remove buttons are UI-only.
- Invitation decline/cancel endpoint is not implemented.
- Email sending for invitations is not implemented.
- Dedicated Socket.IO typing, read receipt, and explicit online/offline presence events are not implemented.
- `POST /messages` and `PATCH /messages/:id/read` REST endpoints are not implemented.
- Worker and manager profile settings are mostly UI and need API wiring.
- Team member actions such as view profile, edit member, change role, and remove member are menu placeholders.
- Task endpoints return broad lists; server-side query/search/filter/pagination is still deferred.
- File uploads and photo proof are not implemented.

---

## Roadmap

| Week | Feature | Status |
|---|---|---|
| 1 | Project setup, server/client scaffolding, DB schema | Done |
| 2 | Auth, sessions, validation | Done |
| 3 | Invitations, tasks, basic worker/manager UI | Done |
| 4 | Real-time location and Google Maps tracking | Done |
| 5 | Real-time direct chat with DB history | Done |
| 6 | Shared shell, role routing, dashboard analytics, team UX | Done |
| 7+ | Fix known gaps, polish, tests, deployment, notifications, uploads | Pending |
