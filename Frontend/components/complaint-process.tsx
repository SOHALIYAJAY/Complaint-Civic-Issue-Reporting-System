import { Clock, CheckCircle, AlertCircle, Users, Zap } from 'lucide-react'

const processSteps = [
  {
    id: 1,
    title: 'Complaint Filed',
    description: 'Your complaint is registered in the system',
    icon: AlertCircle,
    duration: 'Immediate',
  },
  {
    id: 2,
    title: 'Under Review',
    description: 'Our team reviews your complaint details',
    icon: Clock,
    duration: '1-2 Days',
  },
  {
    id: 3,
    title: 'Assigned to Department',
    description: 'Complaint assigned to relevant department',
    icon: Users,
    duration: '2-3 Days',
  },
  {
    id: 4,
    title: 'Work in Progress',
    description: 'Department takes action on your complaint',
    icon: Zap,
    duration: '3-7 Days',
  },
  {
    id: 5,
    title: 'Resolved & Feedback',
    description: 'Issue resolved and feedback requested',
    icon: CheckCircle,
    duration: 'Completion',
  },
]

const resolutionInfo = [
  {
    priority: 'High',
    timeframe: '3-5 days',
    color: 'from-red-500 to-orange-500',
  },
  {
    priority: 'Medium',
    timeframe: '5-10 days',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    priority: 'Low',
    timeframe: '10-15 days',
    color: 'from-yellow-500 to-green-500',
  },
]

export default function ComplaintProcess() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4 text-balance">
            How the Complaint Process Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent tracking from filing to resolution
          </p>
        </div>

        {/* Process Timeline */}
        <div className="mb-16">
          <div className="grid md:grid-cols-5 gap-4 md:gap-2 mb-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Card */}
                  <div className="glass-effect rounded-lg p-4 sm:p-6 border border-border w-full mb-4 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="text-xs font-bold text-primary bg-primary/10 inline-block px-3 py-1 rounded-full">
                      {step.duration}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block w-1 h-8 bg-gradient-to-b from-primary/50 to-transparent"></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden">
            <div className="space-y-6 relative pl-8">
              {processSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.id}>
                    {/* Timeline dot and line */}
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="absolute left-3.5 top-8 w-1 h-16 bg-gradient-to-b from-primary/50 to-transparent"></div>
                    )}

                    {/* Content */}
                    <div className="pt-1">
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      <span className="text-xs font-bold text-primary bg-primary/10 inline-block px-3 py-1 rounded-full mt-2">
                        {step.duration}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Resolution Time Info */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-primary mb-8 text-center">Expected Resolution Time</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {resolutionInfo.map((info, index) => (
              <div key={index} className="glass-effect rounded-lg p-6 border border-border hover:shadow-lg transition-shadow duration-300">
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${info.color} mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold">{info.priority[0]}</span>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{info.priority} Priority</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{info.timeframe.split('-')[0]}</span>
                  <span className="text-muted-foreground">days</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Average resolution time</p>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Guidelines Box */}
        <div className="glass-effect rounded-xl border border-border p-8 md:p-12">
          <h3 className="text-2xl font-bold text-primary mb-8 text-center">Complaint Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Be Specific</h4>
                  <p className="text-sm text-muted-foreground">Provide clear details about the issue and its location</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Add Evidence</h4>
                  <p className="text-sm text-muted-foreground">Upload photos or videos to support your complaint</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Accurate Location</h4>
                  <p className="text-sm text-muted-foreground">Ensure you provide the exact address or landmark</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <span className="text-orange-600 font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">No Duplicates</h4>
                  <p className="text-sm text-muted-foreground">Check if your complaint is already registered</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <span className="text-orange-600 font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Respect Privacy</h4>
                  <p className="text-sm text-muted-foreground">Don't include personal information of other citizens</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <span className="text-orange-600 font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Truthful Content</h4>
                  <p className="text-sm text-muted-foreground">Report only genuine civic issues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
