# Later Features

Ideas and edge cases discovered during development that are intentionally
deferred to keep the MVP focused. The MVP core flow is done:

> **Manager assigns tasks → sees workers live on a map → chats with them.**

Anything that does not block that flow belongs here, not in the current sprint.

---

## Rule of thumb

Before building anything new, ask:
*"Can a manager still assign tasks, see workers on a map, and chat without this?"*

If yes → it belongs here.

---

## Auth & Membership

- **Multi-organization support** — Let one user belong to multiple
  organizations at the same time (e.g. manager in Org A, worker in Org B).
  The `memberships` table already supports this; only the accept-invitation
  logic and a login-then-accept flow need to change.

- **Resign / leave organization** — Let a worker leave an organization so
  they can join another. Needs a `leave` route plus adjusted accept logic
  (check membership per-org instead of blocking on existing email).
  Decide what happens to an org when its owner/manager leaves.

- **Owner role** — A third role above manager (owner can hire/remove
  managers, delete the org). The schema can take it; just add `owner` to the
  role values. Currently using two roles: manager and worker.

- **Password change / reset** — `changePassword`, `forgotPassword`,
  `resetPassword` already exist in `server/src/services/auth.ts` but are **not
  exposed via routes**. To ship them: move the reset token out of the
  in-memory `Map` (in `validations/index.ts`) into a persistent store
  (DB table or Redis) so it survives restarts/replicas, then wire the
  `authRoute` + controller + client forms.

---

## Invitations

- **Email automation** — Send invite links automatically via email
  (e.g. Resend or SendGrid) instead of the manager copying the link and
  sending it manually. The server already returns `inviteLink`; the client
  `CreateInvitationModal` just copies it to the clipboard for now.

- **Invitation expiry** — Make invitations expire after a set time and let
  managers cancel or resend pending invites.

- **Decline UX** — `POST /invitations/decline` exists on the server; add a
  "Decline" action in the `PendingInvitations` list so managers can revoke
  invites from the UI.

---

## Location

- **Location history / path replay** — Store a worker's full movement trail
  in Postgres (not just the latest position in Redis) and replay their route
  for a given day. The `locations` table exists but is currently unused
  (live position is Redis-backed with a 1h TTL).

---

## Chat

- **Group chat** — Let a manager message the whole team at once. Needs a
  `conversations` table; current design is one-to-one only.

- **Media messages** — Images, voice notes, file attachments.

- **Message edit / delete / reactions.**

- **Read receipts in UI** — The backend supports read state
  (`PATCH /messages/:id/read`, `chat:read` socket event, `message-read`
  broadcast, `read_at` column). The client chat hooks still need to call
  these and render "read" ticks.

- **Typing indicator in UI** — The backend broadcasts `chat:typing`
  (with `senderId`). The client needs to listen and render a "typing…"
  state in the `MessageThread`.

- **Unread badge accuracy** — `ConversationList` shows an unread count
  derived from socket events; wire it to the persisted `read_at` state so it
  survives reloads.

---

## Query / Search / Filter / Pagination

- **Status filter** — Filter tasks by status (`pending`, `in_progress`,
  `completed`) via query param (e.g. `?status=pending`).

- **Title search** — Full-text or `ILIKE` search on task title
  (e.g. `?search=meter reading`).

- **Pagination** — Limit results with `?page=1&limit=20` instead of
  returning all rows at once. Needs a total count in the response for the
  client to render page controls.

- **Sorting** — Sort by `created_at`, `deadline`, or `status` via
  `?sortBy=deadline&order=asc`.

> These apply primarily to the tasks list endpoint but the same pattern will
> be reused for invitations, locations history, and messages.

---

## Platform / Admin

- **Super-admin panel** — A separate dashboard for the software owner (me)
  to manage subscriptions, view usage stats across organizations, and handle
  billing — without accessing any org's internal data.

- **Subscriptions / billing** — Tie organizations to a plan; gate features
  by plan tier.

---

## Polish / Misc

- **Push & email notifications** — Notify a manager when a task is completed,
  notify a worker when assigned a new task.

- **Task photo proof** — Let a worker attach a photo when marking a task done.

- **Worker profile settings** — The profile page has an Availability toggle,
  Notifications, and Vehicle entries that are UI-only. Wire them to real
  settings/state (plus a `PATCH /auth/me` or profile endpoint if needed).

- **Empty `message` fix (resolved)** — The accept-invitation controller
  already returns the service's `message` ("Invitation accepted!"). Noted
  here for history.

---

## Cleanup (resolved — kept for history)

- **`chat-list/page.tsx`** — Removed. The real `/chats` page is used instead.
- **`BottomNavigation`** — Now links to `/chats` (legacy `/worker/chat` removed).
- **`acceptInvitation.ts` hook** — Was missing (broke the `/join` flow). Added
  and wired to `POST /invitations/accept`.
