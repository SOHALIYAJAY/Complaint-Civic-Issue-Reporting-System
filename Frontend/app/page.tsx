import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import HeroSection from '@/components/hero-section'
import StatisticsSection from '@/components/statistics-section'
import DistrictsMap from '@/components/districts-map'
import ActivityFeed from '@/components/activity-feed'
import TimelineSection from '@/components/timeline-section'
import DepartmentsSection from '@/components/departments-section'
import VisionSection from '@/components/vision-section'
import ProjectShowcase from '@/components/project-showcase'
import Footer from '@/components/footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <UtilityBar />
      <Header />
      <HeroSection />
      <StatisticsSection />
      <ActivityFeed />
      <TimelineSection />
      {/* <DepartmentsSection /> */}
      <VisionSection />
      {/* <ProjectShowcase /> */}
      <Footer />
    </main>
  )
}
