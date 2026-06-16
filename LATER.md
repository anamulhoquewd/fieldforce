# Later Features

Ideas and edge cases discovered during development that are intentionally
deferred to keep the MVP focused. None of these block the core flow
(manager assigns tasks → sees workers on a map → chats with them), so they
wait until the MVP is done.

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

## Invitations

- **Email automation** — Send invite links automatically via email
  (e.g. Resend or SendGrid) instead of the manager copying the link and
  sending it manually over WhatsApp/SMS.

- **Invitation expiry** — Make invitations expire after a set time and let
  managers cancel or resend pending invites.

## Location

- **Location history / path replay** — Store a worker's full movement trail
  in Postgres (not just the latest position in Redis) and replay their route
  for a given day.

## Chat

- **Group chat** — Let a manager message the whole team at once. Needs a
  `conversations` table; current design is one-to-one only.
- **Media messages** — Images, voice notes, file attachments.
- **Message edit / delete / reactions.**

## Platform / Admin

- **Super-admin panel** — A separate dashboard for the software owner (me)
  to manage subscriptions, view usage stats across organizations, and handle
  billing — without accessing any org's internal data.

## Polish / Misc

- **Push & email notifications** — Notify a manager when a task is completed,
  notify a worker when assigned a new task.
- **Task photo proof** — Let a worker attach a photo when marking a task done.
- **Empty `message` field fix** — The accept-invitation controller returns an
  empty `message`; wire the service's message through to the response.

---

> Rule of thumb: before building anything new, ask
> "Can a manager still assign tasks, see workers on a map, and chat without
> this?" If yes → it belongs here, not in the current sprint.
