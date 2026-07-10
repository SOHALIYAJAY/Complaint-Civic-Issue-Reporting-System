'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, Mail } from 'lucide-react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    subject: 'general',
    message: '',
  })

  const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.email) { setUserEmail(parsed.email); return }
      }
      // fallback: some apps store email directly
      const email = localStorage.getItem('user_email')
      if (email && email !== 'undefined' && email !== 'null') setUserEmail(email)
    } catch {}
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      const payload = {
        full_name: formData.full_name,
        email: userEmail || '',
        subject: formData.subject,
        message: formData.message,
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitted(true)
        setTimeout(() => {
          setFormData({ full_name: '', subject: 'general', message: '' })
          setSubmitted(false)
        }, 4000)
      } else {
        if (data.errors) {
          alert(`Please fix the following errors:\n${Object.values(data.errors).flat().join('\n')}`)
        } else {
          alert(data.message || 'Failed to send message. Please try again.')
        }
      }
    } catch {
      alert('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-1">Your message has been sent successfully.</p>
          <p className="text-sm text-muted-foreground">Our team will get back to you within 24 hours.</p>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"

  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Send us a Message</h2>
          <p className="text-lg text-muted-foreground">Fill out the form below and we'll get back to you shortly</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          {/* Email indicator for logged-in users */}
          {userEmail && (
            <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-foreground">
                Replying to <span className="font-semibold text-primary">{userEmail}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Your full name"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="general">General Inquiry</option>
                <option value="complaint">Complaint Report</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className={`${inputClass} resize-none`}
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

