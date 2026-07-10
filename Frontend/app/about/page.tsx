import { Metadata } from 'next'
import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import AboutHero from '@/components/about/about-hero'
import MissionVision from '@/components/about/mission-vision'
import WhyPlatform from '@/components/about/why-platform'
import HowItWorks from '@/components/about/how-it-works'
import FeaturesHighlight from '@/components/about/features-highlight'
import TeamTech from '@/components/about/team-tech'

export const metadata: Metadata = {
  title: 'About Us | Gujarat CivicTrack',
  description: 'Learn about Gujarat CivicTrack - A transparent civic complaint portal empowering citizens through smart governance',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <UtilityBar />
      <Header />
      
      {/* Hero Section */}
      <AboutHero />
      
      {/* Mission & Vision */}
      <MissionVision />
      
      {/* Why This Platform */}
      <WhyPlatform />
      
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are using CivicTrack to improve their communities through transparent governance.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-8 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all duration-300 transform hover:scale-105"
          >
            Get Started Now
          </a>
        </div>
      </section>
    </main>
  )
}
