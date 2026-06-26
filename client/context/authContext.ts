"use client"

import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { usePathname } from "next/navigation"
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { toast } from "sonner"

// ---- Types ----
type User = {
  userId: string
  name: string | null
  email: string | null
  organizationId: string
  role: "manager" | "worker"
}

type AuthContextType = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

// ---- Context ----
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ---- Provider: wraps the app, fetches /auth/me once ----
export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith("/auth")
  const [user, setUser] = useState<User | null>(null)
  const [isFetchingUser, setIsFetchingUser] = useState(true)
  const loading = isAuthRoute ? false : isFetchingUser

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data.data)
    } catch (err: any) {
      setUser(null)
      handleAxiosError(err)
    } finally {
      setIsFetchingUser(false)
    }
  }

  useEffect(() => {
    if (isAuthRoute) {
      return
    }

    let mounted = true

    const initializeUser = async () => {
      await fetchUser()
    }

    if (mounted) {
      initializeUser()
    }

    return () => {
      mounted = false
    }
  }, [isAuthRoute])

  const refresh = async () => {
    setIsFetchingUser(true)
    await fetchUser()
  }

  const logout = async () => {
    try {
      await api.post("/auth/signout")
      toast.success("Loged out successfully")
    } catch (err: any) {
      // ignore — we clear local state regardless
      toast.error(err?.message)
    }
    setUser(null)
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, refresh, logout } },
    children
  )
}

// ---- Hook: how every component reads the user ----
export function useUser() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error("useUser must be used inside <AuthProvider>")
  }
  return ctx
}
