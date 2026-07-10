'use client'

import { Lightbulb, Target, Heart, Zap } from 'lucide-react'

export default function MissionVision() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Mission & Vision</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Driving transparent governance and citizen empowerment through technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
              
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize citizen-government interaction by providing a transparent, efficient, and accountable platform for reporting, tracking, and resolving civic issues. We empower citizens to actively participate in improving their communities through technology-driven governance.
              </p>

              <ul className="space-y-3 pt-4">
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Citizen-centric approach to governance</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Real-time transparency and accountability</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Efficient resolution of civic complaints</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Lightbulb className="w-7 h-7 text-accent" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
              
              <p className="text-muted-foreground leading-relaxed">
                To create a Gujarat where every citizen is empowered to contribute to smart city development through transparent digital governance. We envision a state where complaints are resolved swiftly, accountability is ensured, and citizens and government work collaboratively for sustainable development.
              </p>

              <ul className="space-y-3 pt-4">
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">A digitally empowered society</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Zero-tolerance for citizen grievances</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Data-driven smart city development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
