'use client'

import { Users, ClipboardList, Building2, CheckCircle, MessageSquare } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: 'Citizen Reports',
      description: 'Citizens report civic issues with location, photos, and details'
    },
    {
      icon: ClipboardList,
      title: 'Admin Reviews',
      description: 'Admin team validates and categorizes the complaint'
    },
    {
      icon: Building2,
      title: 'Department Action',
      description: 'Relevant department is assigned with SLA monitoring'
    },
    {
      icon: CheckCircle,
      title: 'Resolution',
      description: 'Department resolves and closes the complaint'
    },
    {
      icon: MessageSquare,
      title: 'Feedback',
      description: 'Citizen rates experience and provides feedback'
    }
  ]

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">The complete complaint resolution journey</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary -translate-y-1/2"></div>

          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Step card */}
                <div className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground text-center mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">{step.description}</p>
                </div>

                {/* Arrow connector for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-8 items-center justify-center w-6 h-6 -translate-y-1/2">
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-accent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Real-time Updates',
              description: 'Get instant notifications at every step of complaint resolution'
            },
            {
              title: 'SLA Compliance',
              description: 'Every complaint has a defined timeline with escalation if delayed'
            },
            {
              title: 'Transparent Tracking',
              description: 'View complete complaint history and department progress'
            }
          ].map((benefit, idx) => (
            <div key={idx} className="text-center">
              <h4 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h4>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
