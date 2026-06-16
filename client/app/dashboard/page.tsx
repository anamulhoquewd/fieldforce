"use client"

import { Button } from "@/components/ui/button"
import useSignout from "@/hooks/auth/signout"

function Dashboard() {
  const { loading, handleSingout } = useSignout()
  return (
    <div>
      welcome to the dashboard
      <div>
        <Button
          variant={"destructive"}
          disabled={loading}
          onClick={handleSingout}
        >
          {loading ? "Signout..." : "Signout"}
        </Button>
      </div>
    </div>
  )
}

export default Dashboard
