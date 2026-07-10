import Image from 'next/image'

export default function ProjectShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Building Smart Governance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform empowers citizens and government departments to work together for a better Gujarat. Transparency, accountability, and efficiency at every step.
          </p>
        </div>

        {/* Image Showcase with Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          {/* Image */}
          <div className="relative h-96 lg:h-full rounded-xl overflow-hidden shadow-2xl border border-border">
            <Image
              src="/civic-governance-hero.jpg"
              alt="Government Officers Collaborating on Civic Governance - Smart City Administration"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Transparent Governance Platform
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our innovative platform transforms how citizens interact with government departments. From complaint filing to real-time resolution tracking, we ensure every voice is heard and every issue is resolved.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Seamless Complaint Management</h4>
                  <p className="text-sm text-muted-foreground">File, track, and resolve complaints in one unified platform</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Real-time Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Track SLA compliance and resolution progress instantly</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Department Collaboration</h4>
                  <p className="text-sm text-muted-foreground">Streamlined workflow across multiple government departments</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">Data-driven Insights</h4>
                  <p className="text-sm text-muted-foreground">Advanced analytics for informed decision-making</p>
                </div>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-secondary transition-colors duration-300">
                Explore Features
              </button>
              <button className="px-8 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors duration-300">
                View Case Studies
              </button>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 border-t border-border">
          {[
            { label: 'Complaints Resolved', value: '25,000+' },
            { label: 'Active Users', value: '100,000+' },
            { label: 'Government Departments', value: '28' },
            { label: 'Districts Covered', value: 'All 33' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
