import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ROLE_COOKIE_NAME, getRoleHome, type UserRole } from "@/lib/auth-role"

const PROTECTED_ROUTES = [
  "/",
  "/dashboard",
  "/tasks",
  "/team",
  "/maps",
  "/chats",
  "/profile",
]

const AUTH_ROUTES = ["/auth/signin", "/auth/signup"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionCookie = request.cookies.get("session")
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME)?.value
  const isLoggedIn = Boolean(sessionCookie)
  const role =
    roleCookie === "manager" || roleCookie === "worker"
      ? (roleCookie as UserRole)
      : null

  const isProtected =
    pathname === "/" ||
    PROTECTED_ROUTES.some(
      (route) => route !== "/" && pathname.startsWith(route)
    )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/signin", request.url)
    loginUrl.searchParams.set("from", pathname)

    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(role ? getRoleHome(role) : "/dashboard", request.url)
    )
  }

  if (isLoggedIn && role) {
    if (role === "manager" && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (role === "manager" && pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/dashboard/profile", request.url))
    }

    if (role === "worker" && pathname.startsWith("/dashboard/profile")) {
      return NextResponse.redirect(new URL("/profile", request.url))
    }

    if (role === "worker" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
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
