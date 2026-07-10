'use client'

import { MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react'

export default function ContactInfo() {
  const contactDetails = [
    {
      icon: MapPin,
      title: 'Head Office',
      details: ['Gandhinagar, Gujarat', 'India - 382355'],
      colorClass: 'text-primary'
    },
    {
      icon: Phone,
      title: 'Helpline Numbers',
      details: ['1800-233-7777 (Toll Free)', '+91-79-2323-5555'],
      colorClass: 'text-accent'
    },
    {
      icon: Mail,
      title: 'Email Address',
      details: ['support@civictrack.gov.in', 'complaints@civictrack.gov.in'],
      colorClass: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 1:00 PM'],
      colorClass: 'text-green-600'
    }
  ]

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contact Information</h2>
          <p className="text-lg text-muted-foreground">Multiple ways to reach our support team</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactDetails.map((contact, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4`}>
                  <contact.icon className={`w-6 h-6 ${contact.colorClass}`} />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3">{contact.title}</h3>
                
                <div className="space-y-2">
                  {contact.details.map((detail, didx) => (
                    <p key={didx} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contact */}
        <div className="mt-16 p-6 rounded-xl border-2 border-red-200 bg-red-50/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 mb-1">Emergency Contact</h4>
              <p className="text-red-700 text-sm">
                For urgent civic emergencies, contact municipal emergency services: <strong>1091</strong> or your local police department.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}