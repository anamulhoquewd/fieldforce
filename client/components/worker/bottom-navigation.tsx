'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, MessageSquare, User } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/tasks", label: "My Tasks", icon: ClipboardList },
    { href: "/chats", label: "Chats", icon: MessageSquare, badge: 1 },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 relative ${
                active ? 'text-teal-600' : 'text-gray-600'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-1/3 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
