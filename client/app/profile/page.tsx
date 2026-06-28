"use client"

import { useUser } from "@/context/authContext"
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Truck,
} from "lucide-react"
import { useState } from "react"

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export default function ProfilePage() {
  const { user, logout } = useUser()
  const [availability, setAvailability] = useState(true)

  return (
    <div className="min-h-screen bg-background md:mx-auto md:max-w-2xl">
      <div className="sticky top-0 z-20 border-b border-border bg-background px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="border-b border-border bg-card px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {user?.name ?? "—"}
            </h2>
            <p className="text-sm capitalize text-muted-foreground">
              {user?.role ?? "—"}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {availability ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
              <svg
                className="h-5 w-5 text-teal-600 dark:text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="font-medium text-foreground">Availability</span>
          </div>
          <button
            onClick={() => setAvailability(!availability)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              availability ? "bg-teal-500" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`mt-0.5 inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                availability ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <button className="flex w-full items-center justify-between border-b border-border px-4 py-4 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Bell size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-foreground">Notifications</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button className="flex w-full items-center justify-between border-b border-border px-4 py-4 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Truck size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-medium text-foreground">
              Vehicle & equipment
            </span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button className="flex w-full items-center justify-between border-b border-border px-4 py-4 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <HelpCircle
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <span className="font-medium text-foreground">Help & support</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut size={20} className="text-destructive" />
            </div>
            <span className="font-medium text-destructive">Sign out</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
