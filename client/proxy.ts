import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Routes that require the user to be logged in.
const PROTECTED_ROUTES = [
  "/dashboard",
  "/tasks",
  "/team",
  "/maps",
  "/chats",
  "/profile",
]

// Routes only for logged-out users (redirect away if already logged in).
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The session cookie set by your backend (httpOnly, readable here server-side).
  const sessionCookie = request.cookies.get("session")
  const isLoggedIn = Boolean(sessionCookie)

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // 1. Not logged in + trying to reach a protected page → send to login.
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/signin", request.url)
    loginUrl.searchParams.set("from", pathname)

    return NextResponse.redirect(loginUrl)
  }

  // 2. Already logged in + trying to reach login/signup → send to dashboard.
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 3. Otherwise, let the request through.
  return NextResponse.next()
}

// Only run proxy on these paths (skips static files, images, api, etc.)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/team/:path*",
    "/maps/:path*",
    "/chats/:path*",
    "/profile/:path*",
    "/auth/signin",
    "/auth/signup",
  ],
}
