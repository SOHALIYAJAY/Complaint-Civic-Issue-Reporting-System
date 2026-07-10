'use client'

import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ProfileHeaderProps {
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
}

export default function ProfileHeader({
  title = 'My Profile',
  subtitle = 'Manage your personal information and account settings',
  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile' },
  ],
}: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <a href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-slate-900 font-medium">{item.label}</span>
            )}
            {index !== breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4" />}
          </div>
        ))}
      </div>

      {/* Title and Subtitle */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title} </h1>
        <p className="text-slate-600 mt-2">{subtitle}</p>
      </div>
    </div>
  )
}
