import { WorkerDashboard } from '@/components/worker/worker-dashboard'

export const metadata = {
  title: 'Worker Dashboard | Task Management',
  description: 'View your tasks, track progress, and communicate with managers',
}

export default function WorkerDashboardPage() {
  return (
    <div>
      <WorkerDashboard />
    </div>
  )
}
