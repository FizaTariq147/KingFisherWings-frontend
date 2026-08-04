import { WelcomeBanner } from '../../../../components/dashboard/WelcomeBanner'
import { QuickAccessToolbar } from '../../../../components/dashboard/QuickAccessToolbar'
import { CurrentActiveJobsWidget } from '../../../../components/widgets/CurrentActiveJobsWidget'
import { CurrentActiveShipmentsWidget } from '../../../../components/widgets/CurrentActiveShipmentsWidget'
import { RecentInvoicesWidget } from '../../../../components/widgets/RecentInvoicesWidget'
import { TodoListWidget } from '../../../../components/widgets/TodoListWidget'
import PendingQuotationsWidget from '../../../../components/widgets/PendingQuotationsWidget'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const productName = user?.product || 'KingFisher Tech Gold'
  const tenantLabel = user?.name ? `Signed in as ${user.name}` : undefined

  return (
    <div className="pb-16">
      <div className="space-y-4">
        <WelcomeBanner productName={productName} tenantName={tenantLabel} />
        <QuickAccessToolbar />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PendingQuotationsWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CurrentActiveShipmentsWidget />
          <CurrentActiveJobsWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentInvoicesWidget />
          <TodoListWidget />
        </div>
      </div>
    </div>
  )
}
