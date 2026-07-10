import { Metadata } from 'next'
import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import ContactHero from '@/components/contact/contact-hero'
import ContactInfo from '@/components/contact/contact-info'
import ContactForm from '@/components/contact/contact-form'
import FAQSection from '@/components/contact/faq-section'
// import SocialMedia from '@/components/contact/social-media'

export const metadata: Metadata = {
  title: 'Contact Us | Gujarat CivicTrack',
  description: 'Get in touch with Gujarat CivicTrack support team. Find contact information, FAQs, and ways to reach us.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <UtilityBar />
      <Header />
      
      {/* Hero Section */}
      <ContactHero />
      
      {/* Contact Information */}
      <ContactInfo />
      
      {/* Contact Form */}
      <ContactForm />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Social Media */}
      {/* <SocialMedia /> */}

      {/* Map Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">Visit Our Office</h2>
          <div className="w-full h-96 rounded-xl overflow-hidden border border-border shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.3825477233496!2d72.63614631549386!3d23.18435589063669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c20a00dc00001%3A0x86f0389ba61bf147!2sGandhinagar%2C%20Gujarat%20382001!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  )
}