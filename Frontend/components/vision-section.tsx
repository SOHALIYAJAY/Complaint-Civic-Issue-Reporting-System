import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link  from 'next/link'

export default function VisionSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Smart Governance for Gujarat
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our vision is to transform citizen-government interaction through transparency, accountability, and technology. Every complaint matters, and we're committed to resolving issues faster.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Digital-first complaint management system',
                'Real-time SLA tracking and enforcement',
                'Multi-channel complaint submission',
                'AI-powered complaint categorization',
                'Mobile app for on-the-go reporting',
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{point}</span>
                </div>
              ))}
            </div>
             <Link href='/about'>
            <Button className="bg-primary hover:bg-secondary text-primary-foreground font-semibold py-6 px-8 text-lg">
              Learn More About Our Mission
            </Button>
            </Link>
          </div>

          {/* Right Content - Government Schemes */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Popular Government Schemes</h3>
            
            <div className="space-y-4">
              {[
                {
                  name: 'Gujarat Infrastructure Development Board',
                  desc: 'Rapid infrastructure development',
                  icon: '🏗️',
                },
                {
                  name: 'Smart City Mission',
                  desc: 'Technology-driven urban development',
                  icon: '🌆',
                },
                {
                  name: 'Swachh Bharat Mission',
                  desc: 'Nationwide cleanliness initiative',
                  icon: '✨',
                },
                {
                  name: 'Jal Jeevan Mission',
                  desc: 'Household water supply scheme',
                  icon: '💧',
                },
                {
                  name: 'Digital India Initiative',
                  desc: 'Digital infrastructure deployment',
                  icon: '💻',
                },
              ].map((scheme, index) => (
                <div
                  key={scheme.name}
                  className="group bg-white rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer slide-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{scheme.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {scheme.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {scheme.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
