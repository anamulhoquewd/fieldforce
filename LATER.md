# Later Features

Deferred work discovered while building the MVP. These items do not block the core loop: a manager invites workers, assigns tasks, sees workers on a map, and chats with them.

---

## Fix Before Polish

- **Add the missing invitation acceptance hook** - `/join` renders `AcceptRequestForm`, which imports `@/hooks/auth/acceptInvitation`. That hook is not currently in the tree. Either extract acceptance logic from `hooks/dashboard/team/useInvitation.ts` or create a dedicated auth hook for `/join`.

- **Wire invitation resend/remove actions** - `PendingInvitations` renders resend and remove buttons, but they are UI-only today.

- **Clean old typo/legacy files** - `components/alart.tsx`, `components/chat/message-thred.tx`, and `components/dashboard/dahsboard-overview.tsx` should be renamed or removed once imports are cleaned up.

## Auth & Membership

- **Multi-organization support** - Let one user belong to multiple organizations at once. The `memberships` table supports this, but invitation acceptance and login context need organization switching.

- **Leave organization** - Let a worker leave an organization and join another. Needs a leave route plus membership-aware accept-invitation logic.

- **Owner role** - Add an owner role above manager for organization billing, manager administration, and organization deletion.

- **Team member management actions** - Implement view profile, edit member, change role, and remove member from the team table menu.

## Invitations

- **Email automation** - Send invite links through an email provider instead of manual copying.

- **Invitation expiry** - Expire invitations after a configured time.

- **Cancel / decline invitations** - Add API support for canceling pending invitations and declining received invitations.

- **Resend invitations** - Add backend support and real UI state for resending invite links.

## Location

- **Location history / path replay** - Store worker movement in Postgres for route replay instead of keeping only latest position in Redis.

- **Explicit presence events** - Add dedicated Socket.IO events such as `worker-status-changed` and `worker-tasks-updated`. Current online/offline state is inferred from latest location timestamps.

## Chat

- **REST send endpoint** - Add `POST /messages` as a fallback to Socket.IO sending.

- **Read receipts** - Add `PATCH /messages/:id/read` and a `chat:read` Socket.IO event.

- **Typing indicator** - Add a `chat:typing` Socket.IO event.

- **Group chat** - Let a manager message the whole team. This likely needs a `conversations` table.

- **Media messages** - Images, voice notes, and file attachments.

- **Message edit/delete/reactions** - Basic message lifecycle and lightweight reactions.

## Query / Search / Filter / Pagination

- **Task status filter** - Support `GET /tasks/list?status=pending`.

- **Task title search** - Support title search, likely through `ILIKE` first and full-text search later.

- **Pagination** - Add `page`, `limit`, and total count responses for task lists and other high-volume tables.

- **Sorting** - Support sorting by `created_at`, `deadline`, or `status`.

- **Reuse the pattern** - Apply the same query model to invitations, location history, memberships, and messages.

## Profiles & Settings

- **Profile update API** - Wire worker and manager profile forms to real backend routes.

- **Password flows** - Expose `changePassword`, `forgotPassword`, and `resetPassword` through routes and UI.

- **Worker profile stats** - Replace static/profile-only values with real task query counts.

## Notifications & Proof Of Work

- **Push/email notifications** - Notify workers about new tasks and managers about completed tasks.

- **Task photo proof** - Let workers attach a completion photo.

- **File uploads** - Add Cloudflare R2 or similar storage for task and profile attachments.

## Platform / Admin

- **Super-admin panel** - Let the software owner manage subscriptions, usage, billing, and tenants without accessing organization-private operational data.

---

Rule of thumb: before building anything new, ask whether a manager can still assign tasks, see workers on a map, and chat without it. If yes, it belongs here until the MVP is stable.
