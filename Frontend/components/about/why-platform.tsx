'use client'

import { CheckCircle, AlertCircle, TrendingUp, Lock } from 'lucide-react'

export default function WhyPlatform() {
  const problems = [
    {
      icon: AlertCircle,
      title: 'Lack of Transparency',
      description: 'Citizens had no way to track complaint status or understand the resolution process'
    },
    {
      icon: AlertCircle,
      title: 'Delayed Response',
      description: 'Manual processes led to slow complaint processing and resolution'
    },
    {
      icon: AlertCircle,
      title: 'No Accountability',
      description: 'Absence of clear accountability mechanisms and performance metrics'
    },
    {
      icon: AlertCircle,
      title: 'Poor Communication',
      description: 'Limited feedback channels between citizens and government departments'
    }
  ]

  const solutions = [
    {
      icon: CheckCircle,
      title: 'Complete Transparency',
      description: 'Real-time tracking and updates for every complaint with full visibility'
    },
    {
      icon: CheckCircle,
      title: 'Faster Resolution',
      description: 'Automated workflow and SLA monitoring ensure timely complaint resolution'
    },
    {
      icon: CheckCircle,
      title: 'Built-in Accountability',
      description: 'Performance metrics and escalation system ensure accountability at all levels'
    },
    {
      icon: CheckCircle,
      title: 'Better Communication',
      description: 'Direct communication channels and real-time notifications for citizens'
    }
  ]

  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Why CivicTrack?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From traditional systems to smart governance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Problems */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              Traditional System Issues
            </h3>
            <div className="space-y-4">
              {problems.map((problem, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <problem.icon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{problem.title}</h4>
                      <p className="text-sm text-muted-foreground">{problem.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              CivicTrack Solutions
            </h3>
            <div className="space-y-4">
              {solutions.map((solution, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-green-200/30 bg-green-50/30 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <solution.icon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{solution.title}</h4>
                      <p className="text-sm text-muted-foreground">{solution.description}</p>
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
