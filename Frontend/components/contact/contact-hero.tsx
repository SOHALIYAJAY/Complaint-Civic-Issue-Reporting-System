'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function ContactHero() {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/atal-bridge-ahmedabad-bg.jpg"
        alt="Atal Pedestrian Bridge, Sabarmati Riverfront, Ahmedabad"
        fill
        className="object-cover object-center"
        priority
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Animated background elements overlay */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative text-center px-4 max-w-3xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-accent/20 rounded-full border border-accent/30">
            <p className="text-sm font-semibold text-accent">Contact & Support</p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Get in Touch With Us
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100">
            We are here to assist you
          </p>
          
          <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Have questions, feedback, or technical issues? Our dedicated support team is ready to help you 24/7.
          </p>
        </div>
      </div>
    </section>
  )
}