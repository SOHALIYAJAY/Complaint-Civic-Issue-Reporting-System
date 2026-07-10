interface TimelineStep {
  title: string
  description: string
  icon: string
}

const steps: TimelineStep[] = [
  {
    title: 'Citizen Files Complaint',
    description: 'Report a civic issue through the portal',
    icon: '👤',
  },
  {
    title: 'Admin Verification',
    description: 'Complaint is reviewed and assigned',
    icon: '🔍',
  },
  {
    title: 'Department Action',
    description: 'Assigned officer takes action',
    icon: '👷',
  },
  {
    title: 'Resolution',
    description: 'Issue is fixed and verified',
    icon: '✅',
  },
  {
    title: 'Feedback',
    description: 'Citizen provides feedback',
    icon: '⭐',
  },
]

export default function TimelineSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Complaint Lifecycle
          </h2>
          <p className="text-lg text-muted-foreground">
            From filing to resolution - transparent progress at every step
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden sm:block">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary transform -translate-y-1/2"></div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  {/* Step Circle */}
                  <div className="flex justify-center mb-8">
                    <div className="relative z-10 w-20 h-20 rounded-full bg-white border-4 border-gradient-to-r from-primary to-secondary flex items-center justify-center text-4xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                      {step.icon}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="text-center pt-24">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="sm:hidden">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative pl-16">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center text-2xl shadow-lg">
                  {step.icon}
                </div>

                {/* Timeline Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-12 bg-gradient-to-b from-primary to-secondary"></div>
                )}

                {/* Content */}
                <div className="bg-white rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
