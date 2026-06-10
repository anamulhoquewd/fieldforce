# FieldForce

A SaaS application for managing field teams. Managers can assign tasks to field workers, track their live locations on a map, and communicate with them in real time.

> 🚧 Work in progress — building in public over 90 days.

## Tech Stack

- **Frontend:** Next.js (TypeScript, Tailwind CSS)
- **Backend:** Hono (Node.js, REST API)
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Cache / Real-time:** Redis (Upstash), Socket.IO
- **Maps:** Leaflet + OpenStreetMap

## Project Structure

fieldforce/
├── client/   # Next.js frontend
├── server/   # Hono API + Socket.IO
└── shared/   # Shared TypeScript types

## Getting Started

```bash
# Run the server
cd server && pnpm install && pnpm dev

# Run the client (in another terminal)
cd client && pnpm install && pnpm dev
```

Copy `.env.example` to `.env` in each project and fill in your own values.

## Status

- [x] Project setup (client + server)
- [ ] Auth & multi-tenancy
- [ ] Tasks & assignments
- [ ] Live location map
- [ ] Real-time chat
- [ ] Dashboard