import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ComplaintsHeader() {
  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80">
      {/* subtle grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-widest mb-2">Citizen Portal</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">My Complaints</h1>
            <p className="text-primary-foreground/80 text-base max-w-lg">
              Track and monitor your submitted civic issues with real-time status updates.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  )
}
