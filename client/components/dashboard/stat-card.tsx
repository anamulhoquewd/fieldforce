import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  subtitle?: string
  trend?: number
  accentColor?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorConfig = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100/80 dark:bg-blue-950/60',
    accent: 'from-blue-50/60 to-blue-100/40 dark:from-blue-950/40 dark:to-blue-900/30',
    trend: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100/80 dark:bg-green-950/60',
    accent: 'from-green-50/60 to-green-100/40 dark:from-green-950/40 dark:to-green-900/30',
    trend: 'text-green-600 dark:text-green-400',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100/80 dark:bg-purple-950/60',
    accent: 'from-purple-50/60 to-purple-100/40 dark:from-purple-950/40 dark:to-purple-900/30',
    trend: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100/80 dark:bg-orange-950/60',
    accent: 'from-orange-50/60 to-orange-100/40 dark:from-orange-950/40 dark:to-orange-900/30',
    trend: 'text-orange-600 dark:text-orange-400',
  },
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  accentColor = 'blue',
}: StatCardProps) {
  const colors = colorConfig[accentColor]

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-liner-to-br ${colors.accent} px-4 py-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-lg hover:scale-105 dark:border-border/30`}>
      {/* Animated background accent */}
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-current opacity-3 blur-2xl transition-all duration-300 group-hover:opacity-5" />
      <div className="absolute -left-12 -bottom-12 h-24 w-24 rounded-full bg-current opacity-2 blur-2xl transition-all duration-500 group-hover:opacity-4" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">{label}</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground leading-none">{value}</p>
          {subtitle && (
            <p className="mt-1.5 text-xs font-medium text-muted-foreground/75 line-clamp-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors.trend} ${colors.badge}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-muted-foreground/60">vs last month</span>
            </div>
          )}
        </div>
        <div className={`shrink-0 rounded-xl ${colors.badge} p-2.5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-3`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}
