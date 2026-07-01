import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </>
  )
}
