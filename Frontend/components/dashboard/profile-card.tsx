'use client'

import { Button } from '@/components/ui/button'
import { User, Mail, MapPin, FileText, Edit } from 'lucide-react'

export default function ProfileCard() {
  const userProfile = {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    district: 'Ahmedabad',
    totalComplaints: 24,
    avatar: '👤',
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Profile</h2>

      <div className="glass-effect rounded-lg border border-border p-8 space-y-6">
        {/* Avatar & Name */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
            {userProfile.avatar}
          </div>
          <h3 className="text-2xl font-bold text-foreground">{userProfile.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">Citizen</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 border-y border-border py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">District</p>
              <p className="text-sm font-medium text-foreground">{userProfile.district}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Complaints</p>
              <p className="text-sm font-medium text-foreground">{userProfile.totalComplaints}</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <Button className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>
    </section>
  )
}
