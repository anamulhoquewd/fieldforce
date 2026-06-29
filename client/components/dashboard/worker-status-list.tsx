import { Badge } from "@/components/ui/badge"
import { WorkerWithLocation } from "./map/live-map"

const statusStyles = {
  Online: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    dot: "bg-green-500",
  },
  Away: {
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    dot: "bg-yellow-500",
  },
  Offline: {
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    dot: "bg-gray-500",
  },
}

export function WorkerStatusList({
  workers,
}: {
  workers: WorkerWithLocation[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Active Workers</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {workers.filter((w) => w.isOnline).length} online
      </p>

      <div className="mt-6 space-y-4">
        {workers.map((worker) => (
          <div key={worker.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {worker.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div
                  className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background ${
                    statusStyles[
                      worker.isOnline
                        ? "Online"
                        : ("Offline" as keyof typeof statusStyles)
                    ].dot
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{worker.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {worker?.currentTask?.title}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  active task{worker.totalAssignedTask?.length !== 1 ? "s " : " "}
                  {worker.totalAssignedTask?.length}
                </p>
              </div>
            </div>
            <Badge
              className={
                statusStyles[
                  worker.isOnline
                    ? "Online"
                    : ("Offline" as keyof typeof statusStyles)
                ].badge
              }
              variant="outline"
            >
              {worker.isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
