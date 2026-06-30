"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useInvitation from "@/hooks/dashboard/team/useInvitation"
import { Mail, RotateCcw, X } from "lucide-react"
import { useState } from "react"
import { dateSeparatorLabel } from "../chat/message-thread"

export function PendingInvitations() {
  const { invitations } = useInvitation(null)
  const [resending, setResending] = useState<string | null>(null)

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending"
  )

  const handleResend = (id: string) => {
    setResending(id)
    setTimeout(() => {
      setResending(null)
    }, 1000)
  }

  //   const handleRemove = (id: string) => {
  //     setInvitations(invitations.filter((inv) => inv.id !== id))
  //   }

  if (pendingInvitations.length === 0) {
    return null
  }

  return (
    <div className="mt-12 space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-foreground">Pending invitations</h4>
        <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
          {pendingInvitations.length}
        </span>
      </div>

      <div className="space-y-3">
        {pendingInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {invitation.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Invited as {invitation.role.toLowerCase()} · sent{" "}
                  {dateSeparatorLabel(invitation.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current"></span>
                Pending
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResend(invitation.id)}
                disabled={resending === invitation.id}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {resending === invitation.id ? "Sending..." : "Resend"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                // onClick={() => handleRemove(invitation.id)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
