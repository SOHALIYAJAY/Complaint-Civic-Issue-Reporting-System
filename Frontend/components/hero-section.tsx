import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
export default function HeroSection() {
  return (
    <>
      {/* Full Size Smart Governance Hero */}
      <section className="relative w-full h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/atal-bridge-ahmedabad-bg.jpg')`,
            backgroundPosition: 'center',
          }}
        >
          {/* Fallback gradient if image doesn't load */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-indigo-800/30 to-amber-600/30"></div>
        </div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-3xl slide-in-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
              Smart Governance for Civic Issues
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 drop-shadow-md">
              Report Problems • Track Progress • Get Solutions - Powered by Digital India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href='/raise-complaint'>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-yellow-500 font-semibold gap-2"
              >
                Raise Complaint Now <ArrowRight className="w-5 h-5" />
              </Button>
              </Link>
              <Link href='/track-complaint'>
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur text-white hover:bg-white/30 font-semibold border border-white/30"
                >
                  Track Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Original Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="slide-in-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transparent Governance for a Better Gujarat
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Report civic issues, track resolution progress, and engage with government departments in real-time. Experience the power of transparent, citizen-centric governance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href='/raise-complaint'>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-yellow-500 font-semibold gap-2">
                Raise Complaint <ArrowRight className="w-5 h-5" />
              </Button>
              </Link>
               <Link href='/my-complaints' >
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold">
                Track Status
              </Button>
               </Link>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span>24/7 Complaint Registration</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Real-time Progress Updates</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Direct Department Communication</span>
              </div>
            </div>
          </div>

          {/* Right Content - Glassmorphism Card */}
          <div className="hidden lg:block">
            <div className="glass-effect rounded-2xl p-8 border-opacity-40 shadow-2xl backdrop-blur-xl">
              <div className="bg-gradient-to-br from-accent/20 to-blue-400/20 rounded-xl p-8 mb-6">
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-4 text-2xl">
                  📱
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Smart Complaint System</h3>
                <p className="text-white/80">File complaints instantly and monitor resolution with SLA tracking</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/70 mb-1">Average Resolution Time</p>
                  <p className="text-2xl font-bold text-accent">7-14 Days</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/70 mb-1">Complaint Success Rate</p>
                  <p className="text-2xl font-bold text-accent">94.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
