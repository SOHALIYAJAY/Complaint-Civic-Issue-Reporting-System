import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import StatisticsCards from '@/components/dashboard/statistics-cards'
import RecentComplaints from '@/components/dashboard/recent-complaints'
import AnalyticsCharts from '@/components/dashboard/analytics-charts'
import RequireAuth from '@/components/auth/RequireAuth'

export const metadata = {
  title: 'Dashboard | Gujarat CivicTrack',
  description: 'View your complaints, track progress, and manage civic issues',
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen bg-background flex flex-col">
        <UtilityBar />
        <Header />

        <div className="flex flex-1 items-stretch">
          {/* Sidebar Navigation - Fixed Width */}
          <DashboardSidebar />

          {/* Main Content - Flexible Width */}
          <div className="flex-1 bg-background overflow-y-auto">
            <div className="px-6 sm:px-8 lg:px-10 py-8">
              {/* Dashboard Header */}
              <DashboardHeader />

              {/* Statistics Cards */}
              <section className="mt-8">
                <StatisticsCards />
              </section>

              {/* Recent Complaints & Charts - Full Width */}
              <div className="space-y-8 mt-8">
                <RecentComplaints />
                <AnalyticsCharts />
              </div>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  )
}

