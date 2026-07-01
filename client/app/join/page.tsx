import { Suspense } from "react"

import { AcceptRequestForm } from "@/components/accept-request-form"
import { Spinner } from "@/components/ui/spinner"

export const metadata = {
  title: "Join Member",
  description: "Accept a request to join the team",
}

export default function JoinMemberPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="size-6" />
            </div>
          }
        >
          <AcceptRequestForm />
        </Suspense>
      </div>
    </div>
  )
}
