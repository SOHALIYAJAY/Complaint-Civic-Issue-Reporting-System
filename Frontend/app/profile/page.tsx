import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
import ProfileHeader from '@/components/profile/profile-header'
import ProfileOverview from '@/components/profile/profile-overview'
import PersonalInformation from '@/components/profile/personal-information'
import SecuritySettings from '@/components/profile/security-settings'
import ActivityLog from '@/components/profile/activity-log'
import RequireAuth from '@/components/auth/RequireAuth'

export const metadata = {
  title: 'My Profile | Gujarat CivicTrack',
  description: 'Manage your personal information and account settings',
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <main className="min-h-screen bg-background flex flex-col">
        <UtilityBar />
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - Fixed Width */}
          <DashboardSidebar />

          {/* Main Content - Flexible Width */}
          <div className="flex-1 bg-background overflow-y-auto">
            <div className="px-6 sm:px-8 lg:px-10 py-8">
              {/* Profile Header with Breadcrumbs */}
              <ProfileHeader />

              {/* Profile Overview Card */}
              <section className="mb-8">
                <ProfileOverview />
              </section>

              {/* Personal Information Section */}
              <section className="mb-8">
                <PersonalInformation />
              </section>

              {/* Security Settings Section */}
              <section className="mb-8">
                <SecuritySettings />
              </section>

              {/* Activity Log Section */}
              <section className="mb-8">
                <ActivityLog />
              </section>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  )
}
