'use client'

import { Code, Database, Shield, Globe } from 'lucide-react'

export default function TeamTech() {
  const techStack = [
    {
      icon: Code,
      title: 'Frontend',
      tech: 'Next.js, React, TypeScript, Tailwind CSS'
    },
    {
      icon: Database,
      title: 'Backend',
      tech: 'Django, PostgreSQL, RESTful APIs'
    },
    {
      icon: Shield,
      title: 'Security',
      tech: 'JWT Authentication, End-to-end Encryption'
    },
    {
      icon: Globe,
      title: 'Deployment',
      tech: 'Docker, AWS, Cloud Storage'
    }
  ]

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* About Development */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Built by Students</h2>
            <p className="text-lg text-muted-foreground mb-4">
              CivicTrack is an innovative academic project developed by passionate students at the Institute of Technology. Our mission is to showcase how technology can revolutionize citizen engagement and governance.
            </p>
            <ul className="space-y-3">
              {[
                'Academic Excellence - University Project',
                'Real-world Problem Solving',
                'Production-Ready Application',
                'Innovative Government Technology'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual representation */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-end justify-center p-4">
                <div className="text-center">
                  <Code className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Innovation</p>
                </div>
              </div>
              <div className="h-32 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-border flex items-end justify-center p-4">
                <div className="text-center">
                  <Database className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Reliability</p>
                </div>
              </div>
              <div className="h-32 rounded-lg bg-gradient-to-br from-blue-500/10 to-primary/10 border border-border flex items-end justify-center p-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Security</p>
                </div>
              </div>
              <div className="h-32 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 border border-border flex items-end justify-center p-4">
                <div className="text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Scalability</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">Technology Stack</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                    <tech.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-foreground mb-2">{tech.title}</h4>
                  <p className="text-sm text-muted-foreground">{tech.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
