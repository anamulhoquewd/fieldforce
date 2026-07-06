import { Geist_Mono, Inter } from "next/font/google"

import { AppShell } from "@/components/app-shell"
import { GoogleMapsScript } from "@/components/google-maps-script"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
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
        <GoogleMapsScript />
        <Providers>
          <AppShell defaultOpen={defaultOpen}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
