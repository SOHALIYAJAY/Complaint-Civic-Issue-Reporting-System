'use client'

import { Button } from '@/components/ui/button'
import { Plus, Eye, Search, User } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      label: 'Raise New Complaint',
      description: 'File a new civic complaint',
      icon: <Plus className="w-6 h-6" />,
      href: '/raise-complaint',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-600',
    },
    {
      label: 'View My Complaints',
      description: 'Track all your complaints',
      icon: <Eye className="w-6 h-6" />,
      href: '/my-complaints',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-600',
    },
    {
      label: 'Track by ID',
      description: 'Search complaint by ID',
      icon: <Search className="w-6 h-6" />,
      href: '/my-complaints',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-600',
    },
    {
      label: 'Edit Profile',
      description: 'Update your information',
      icon: <User className="w-6 h-6" />,
      href: '/profile',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className={`glass-effect rounded-lg p-6 border ${action.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group h-full`}>
              <div className={`${action.bgColor} rounded-lg p-4 mb-4 inline-block group-hover:scale-110 transition-transform`}>
                <div className={action.textColor}>{action.icon}</div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
