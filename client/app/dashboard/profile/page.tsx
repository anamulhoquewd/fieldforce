import ProfileComponent from "@/components/profile/profile-component"

export const metadata = {
  title: "Profile",
  description: "Manage your profile settings and preferences.",
}

export default function DashboardProfilePage() {
  return (
    <div className="min-h-screen bg-background md:mx-auto md:max-w-2xl">
      <div className="sticky top-0 z-20 border-b border-border bg-background px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <ProfileComponent />
    </div>
  )
}
