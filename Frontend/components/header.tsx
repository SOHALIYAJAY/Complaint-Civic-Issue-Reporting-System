'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('access_token')
      const newUserData = localStorage.getItem('user')
      
      if (newToken && newUserData) {
        setIsLoggedIn(true)
        setUser(JSON.parse(newUserData))
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    setIsProfileOpen(false)
    router.push('/login')
  }

  const getNavItems = () => {
    if (!isLoggedIn || !user) {
      // Not logged in - show basic navigation
      return [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]
    }

    const rawRole = user.User_Role || user.role || 'Civic-User'
    const userRole = (typeof rawRole === 'string' && rawRole.toLowerCase().includes('officer')) ? 'Officer' : rawRole

    switch (userRole) {
      case 'Civic-User':
        return [
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Complaints', href: '/my-complaints' },
          { label: 'Contact Us', href: '/contact' },
        ]
      case 'Department-User':
        return [
          { label: 'Dashboard', href: '/department' },
          { label: 'Assigned Complaints', href: '/department/complaints' },
          { label: 'Officers', href: '/department/officers' },
          { label: 'Users', href: '/department/users' },
        ]
      case 'Officer':
        // Show simplified navigation for Officers: Home, About, Officer Dashboard, Contact
        return [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Officer Dashboard', href: '/officer' },
          { label: 'Contact', href: '/contact' },
        ]
      case 'Admin-User':
        return [
          { label: 'Dashboard', href: '/admin' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-base">
              🏛️
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-primary leading-none">Gujarat CivicTrack</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Transparent Governance</p>
            </div>
          </Link>

          {/* Desktop Nav — centered */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/8 font-semibold'
                    : 'text-foreground/70 hover:text-primary hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Sign Up</Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-primary rounded-full hover:bg-primary/90 transition-colors"
                >
                  <span className="text-white font-semibold text-sm">
                    {(user?.username || user?.first_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <div className="border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Show Raise Complaint button only for Civic Users */}
            {isLoggedIn && user && (user.User_Role === 'Civic-User' || user.role === 'Civic-User') && (
              <Link href="/raise-complaint">
                <Button size="sm" className="bg-accent hover:bg-yellow-500 text-accent-foreground font-semibold">
                  Raise Complaint
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/8 font-semibold'
                    : 'text-foreground/70 hover:text-primary hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-3 border-t border-border mt-2">
              {!isLoggedIn ? (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:text-primary"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout() }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}
              
              {/* Show Raise Complaint button only for Civic Users */}
              {isLoggedIn && user && (user.User_Role === 'Civic-User' || user.role === 'Civic-User') && (
                <Link href="/raise-complaint" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-accent hover:bg-yellow-500 text-accent-foreground font-semibold">
                    Raise Complaint
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
