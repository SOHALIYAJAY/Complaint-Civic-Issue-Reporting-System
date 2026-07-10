'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I raise a complaint on CivicTrack?',
      answer: 'You can raise a complaint by logging into your account, clicking "File New Complaint," selecting the issue category, providing location details with photos, and submitting your complaint. You\'ll receive a unique tracking ID immediately.'
    },
    {
      question: 'How can I track my complaint status?',
      answer: 'Once filed, you can track your complaint in real-time through your dashboard. You\'ll receive SMS/email notifications at each stage: submitted, assigned to department, under review, in progress, and resolved.'
    },
    {
      question: 'What is SLA and how does it work?',
      answer: 'SLA (Service Level Agreement) is a guaranteed timeline for complaint resolution. Each complaint type has a defined resolution period. If not resolved within this period, the complaint automatically escalates to senior officials.'
    },
    {
      question: 'How do I escalate a complaint if not resolved?',
      answer: 'If your complaint is not resolved within the SLA period, it automatically escalates to the next level. You can also manually request escalation through the "Escalate" button in your complaint details.'
    },
    {
      question: 'Can I attach documents to my complaint?',
      answer: 'Yes, you can attach photos, videos, and documents (PDF, JPG, PNG up to 5MB each) while filing or updating your complaint. This helps officials better understand and resolve your issue.'
    },
    {
      question: 'How is my privacy protected on CivicTrack?',
      answer: 'We use end-to-end encryption for all data transmission. Your personal information is never shared publicly. You can choose to file anonymous complaints if you prefer.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Find answers to common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground text-left">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                    expandedIndex === idx ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {expandedIndex === idx && (
                <div className="px-6 py-4 border-t border-border bg-primary/2 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}