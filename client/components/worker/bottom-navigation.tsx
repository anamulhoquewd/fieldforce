"use client"

import { ClipboardList, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/tasks", label: "My Tasks", icon: ClipboardList },
    { href: "/chats", label: "Chats", icon: MessageSquare, badge: 1 },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center py-3 ${
                active ? "text-teal-600" : "text-gray-600"
              }`}
            >
              <Icon size={24} />
              <span className="mt-1 text-xs font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-1/3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
