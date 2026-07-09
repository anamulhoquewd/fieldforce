"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "@/components/worker/bottom-navigation"
import { useUser } from "@/context/authContext"
import { usePathname } from "next/navigation"

const HIDDEN_SHELL_ROUTES = [
  "/auth/signin",
  "/auth/signup",
  "/signin",
  "/signup",
  "/join",
]

export function AppShell({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) {
  const pathname = usePathname()
  const { user } = useUser()
  const shouldRenderShell = !HIDDEN_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!shouldRenderShell) {
    return <>{children}</>
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
      {user?.role === "worker" ? <BottomNavigation /> : null}
    </SidebarProvider>
  )
}
