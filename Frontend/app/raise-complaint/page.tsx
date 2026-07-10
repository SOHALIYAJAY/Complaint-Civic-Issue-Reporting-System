import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import RaiseComplaintForm from '@/components/raise-complaint-form'
import RequireAuth from '@/components/auth/RequireAuth'

export const metadata = {
  title: 'Raise a Civic Complaint | Gujarat CivicTrack',
  description: 'Report civic issues in your area for quick resolution through our smart governance portal',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RaiseComplaintPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen bg-background">
        <UtilityBar />
        <Header />
        
        {/* Breadcrumb */}
        <section className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <span>/</span>
            <span className="text-foreground font-medium">Raise Complaint</span>
          </div>
        </div>
      </section>

      {/* Page Header */}
      <section className="py-8 sm:py-12 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 text-balance">
            Raise a Civic Complaint
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Report issues in your area for quick resolution. Your feedback helps us build a better, cleaner, and safer Gujarat.
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <RaiseComplaintForm />

      <Footer />
    </main>
    </RequireAuth>
  )
}
