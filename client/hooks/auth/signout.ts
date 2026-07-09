import api from "@/lib/api"
import { clearRoleCookie } from "@/lib/auth-role"
import { handleAxiosError } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

function useSignout() {
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(false)

  const handleSingout = async () => {
    setLoading(true)
    try {
      const response = await api.post("/auth/signout")
      if (!response.data.success) {
        throw new Error(response.data.error.message)
      }

      clearRoleCookie()
      router.push("/auth/signin")
    } catch (error: any) {
      handleAxiosError(error)

      toast.error("User creation failed!")
    } finally {
      setLoading(false)
    }
  }

  return { handleSingout, loading, setLoading }
}

export default useSignout
