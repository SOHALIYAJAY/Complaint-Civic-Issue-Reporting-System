'use client'

import { Phone, Globe } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'

export default function UtilityBar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-primary text-primary-foreground py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">Helpline: 1800-233-4567</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <div className="w-32 h-8 bg-secondary rounded-md"></div>
            </div>
            
            
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-primary text-primary-foreground py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Helpline: 1800-233-4567</span>
        </div>
        </div>
    </div>
  )
}
