import { Geist_Mono, Inter } from "next/font/google"

import { AppSidebar } from "@/components/app-sidebar"
import { GoogleMapsScript } from "@/components/google-maps-script"
import { Providers } from "@/components/providers"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "@/components/worker/bottom-navigation"
import { cn } from "@/lib/utils"
import { ClipboardList, MessageSquare, User } from "lucide-react"
import { cookies } from "next/headers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <SidebarProvider defaultOpen={defaultOpen}>
          <GoogleMapsScript />
          <Providers>
            <AppSidebar
              main={[]}
              projects={[
                {
                  name: "My Tasks",
                  url: "/tasks",
                  icon: <ClipboardList />,
                },
                {
                  name: "Chat - FieldForce",
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
          </Providers>

          <BottomNavigation />
        </SidebarProvider>
      </body>
    </html>
  )
}
