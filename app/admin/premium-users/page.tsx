import { AdminOnlyPage } from "@/components/admin-only-page"
import { PremiumUsersList } from "@/components/premium-users-list"

export default function PremiumUsersPage() {
  return (
    <AdminOnlyPage title="Premium Users">
      <PremiumUsersList />
    </AdminOnlyPage>
  )
}
