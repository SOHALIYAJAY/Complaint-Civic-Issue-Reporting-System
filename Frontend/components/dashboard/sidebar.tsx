'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plus,
  Eye,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  FileText,
  Edit,
} from 'lucide-react'

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const getMenuItems = () => {
    if (!user) {
      return []
    }

    const rawRole = user.User_Role || user.role || 'Civic-User'
    const userRole = (typeof rawRole === 'string' && rawRole.toLowerCase().includes('officer')) ? 'Officer' : rawRole

    switch (userRole) {
      case 'Civic-User':
        return [
          {
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/dashboard',
          },
          {
            label: 'Raise Complaint',
            icon: <Plus className="w-5 h-5" />,
            href: '/raise-complaint',
          },
          {
            label: 'My Complaints',
            icon: <Eye className="w-5 h-5" />,
            href: '/my-complaints',
          },
          {
            label: 'Profile',
            icon: <User className="w-5 h-5" />,
            href: '/profile',
          },
        ]
      
      case 'Department-User':
        return [
          {
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/department',
          },
          {
            label: 'Officer Portal',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/officer',
          },
          {
            label: 'Profile',
            icon: <User className="w-5 h-5" />,
            href: '/department/profile',
          },
        ]
      
      case 'Officer':
        return [
          {
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/officer',
          },
          {
            label: 'All Complaints',
            icon: <FileText className="w-5 h-5" />,
            href: '/officer/complaints',
          },
          {
            label: 'Status Change',
            icon: <Edit className="w-5 h-5" />,
            href: '/officer/update-status',
          },
          {
            label: 'Profile',
            icon: <User className="w-5 h-5" />,
            href: '/officer/profile',
          },
        ]
      
      case 'Admin-User':
        return [
          {
            label: 'Admin',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/admin',
          },
          {
            label: 'Profile',
            icon: <User className="w-5 h-5" />,
            href: '/admin/profile',
          },
        ]
      
      default:
        return [
          {
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/dashboard',
          },
          {
            label: 'Profile',
            icon: <User className="w-5 h-5" />,
            href: '/profile',
          },
        ]
    }
  }

  const menuItems = getMenuItems()

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden bg-primary text-primary-foreground p-2 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-56 bg-primary text-primary-foreground z-40 transition-transform duration-300 lg:static lg:translate-x-0 lg:h-auto lg:self-stretch lg:w-56 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col px-3 py-6 space-y-2">
          {/* Logo */}
          <div className="mb-6 px-2">
            <h1 className="text-lg font-bold">CivicTrack</h1>
            <p className="text-xs text-primary-foreground/70 mt-1">Smart Governance Portal</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <div
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}
          </nav>
          <div className="border-t border-primary-foreground/20 pt-4">
            <Link href='/logout'>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 font-medium">
             Logout
            </button>
            </Link>
          </div>
        </div>
      </aside>

    </>
  )
}
