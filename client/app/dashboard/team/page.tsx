"use client"

import { CreateInvitationModal } from "@/components/team/create-invitation-modal"
import { PendingInvitations } from "@/components/team/pending-invitations"
import {
  getInitials,
  getWorkerColor,
} from "@/components/dashboard/map/live-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUser } from "@/context/authContext"
import useInvitation from "@/hooks/dashboard/team/useInvitation"
import useMembership from "@/hooks/dashboard/team/useMembership"
import { IInvitation } from "@/interfaces"
import { MoreHorizontal, Search } from "lucide-react"
import { useMemo, useState } from "react"

type RoleType = "manager" | "worker"

export default function TeamPage() {
  const { user } = useUser()
  const { refresh } = useInvitation()
  const { memberships } = useMembership()
  const [filters, setFilters] = useState<{ role?: RoleType }>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [invitationOpen, setInvitationOpen] = useState(false)

  const filteredMembers = useMemo(() => {
    return memberships
      .filter((member) => {
        if (filters.role && member.role !== filters.role) return false
        return true
      })
      .filter((member) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
        )
      })
  }, [filters, searchQuery, memberships])

  const toggleFilter = (key: keyof typeof filters, value: RoleType) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }))
  }

  const handleInvited = (_invitation: IInvitation) => {
    refresh()
    setInvitationOpen(false)
  }

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <h1 className="text-xl font-semibold text-foreground">Members</h1>
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length}{" "}
          {filteredMembers.length === 1 ? "person" : "people"}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search members…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-border bg-background py-2 pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <Button onClick={() => setInvitationOpen(true)}>
            + Create invitation
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 py-2">
          <Button
            variant={filters.role === "manager" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("role", "manager")}
          >
            Manager
          </Button>
          <Button
            variant={filters.role === "worker" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("role", "worker")}
          >
            Worker
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold text-muted-foreground">
                  NAME
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  EMAIL
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  ROLE
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  JOINED
                </TableHead>
                <TableHead className="w-10 font-semibold text-muted-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{
                          backgroundColor: getWorkerColor(member.name),
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {member.name}
                        </p>
                        {member.userId === user?.userId && (
                          <p className="text-xs text-muted-foreground">You</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-foreground">
                    {member.email}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-transparent capitalize text-primary hover:bg-transparent"
                    >
                      {member.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive hover:text-destructive">
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-2 text-muted-foreground">No members found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        )}

        <PendingInvitations />
      </div>

      <CreateInvitationModal
        open={invitationOpen}
        onOpenChange={setInvitationOpen}
        onInvited={handleInvited}
      />
    </main>
  )
}
