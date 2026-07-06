"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "@/components/worker/bottom-navigation"
import { ClipboardList, MessageSquare, User } from "lucide-react"
import { usePathname } from "next/navigation"

const HIDDEN_SHELL_ROUTES = ["/auth/signin", "/auth/signup", "/signin", "/signup", "/join"]

export function AppShell({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) {
  const pathname = usePathname()
  const shouldRenderShell = !HIDDEN_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!shouldRenderShell) {
    return <>{children}</>
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        main={[]}
        projects={[
          {
            name: "Dashboard",
            url: "/",
            icon: <ClipboardList />,
          },
          {
            name: "My Tasks",
            url: "/tasks",
            icon: <ClipboardList />,
          },
          {
            name: "Chats",
            url: "/chats",
            icon: <MessageSquare />,
          },
          {
            name: "Profile",
            url: "/profile",
            icon: <User />,
          },
        ]}
      />
      <SidebarInset>{children}</SidebarInset>
      <BottomNavigation />
    </SidebarProvider>
  )
}
