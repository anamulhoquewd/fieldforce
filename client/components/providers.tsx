"use client"

import { AuthProvider } from "@/context/authContext"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </TooltipProvider>
  )
}
