'use client'

import { MapPin, Clock, BarChart3, Zap, TrendingUp, Eye } from 'lucide-react'

export default function FeaturesHighlight() {
  const features = [
    {
      icon: MapPin,
      title: 'Geo-Tag Complaints',
      description: 'Precise location tagging with map integration for accurate complaint identification'
    },
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Live updates on complaint status from filing to resolution'
    },
    {
      icon: BarChart3,
      title: 'SLA Monitoring',
      description: 'Service level agreement tracking with automatic escalation system'
    },
    {
      icon: Zap,
      title: 'Escalation System',
      description: 'Intelligent escalation to senior officials for delayed complaints'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Data-driven insights for governance and decision-making'
    },
    {
      icon: Eye,
      title: 'Complete Transparency',
      description: 'Public complaint data and department performance visibility'
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Key Features</h2>
          <p className="text-lg text-muted-foreground">Powerful tools for efficient governance</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon */}
              <div className="relative mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Content */}
              <h3 className="relative text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="relative text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
