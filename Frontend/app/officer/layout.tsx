"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Edit, 
  User, 
  ChevronDown 
} from "lucide-react"
import RequireAuth from '@/components/auth/RequireAuth'

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userInitial, setUserInitial] = useState('O')
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const u = JSON.parse(userData)
      setUserInitial((u.username || u.first_name || 'O').charAt(0).toUpperCase())
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/officer" },
    { icon: FileText, label: "All Complaints", path: "/officer/complaints" },
    { icon: Edit, label: "Status Change", path: "/officer/update-status" },
    { icon: User, label: "Profile", path: "/officer/profile" },
  ]

  const navItems: Array<{ icon: any; label: string; path: string }> = [
    // Removed Home, Dashboard, About, Contact as requested
  ]

  return (
    <RequireAuth role={['Officer', 'Department-User', 'Admin-User']}>
      <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 lg:static lg:z-auto
          ${sidebarOpen ? "w-64" : "w-20"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-primary text-primary-foreground transition-all duration-300 flex flex-col shadow-sm
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center border-b border-primary-foreground/20 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">O</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-primary-foreground truncate">Officer Portal</h1>
                <p className="text-xs text-primary-foreground/70 truncate">CivicTrack</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path)
                  setMobileOpen(false)
                }}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary-foreground/80'}`} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-primary-foreground/20">
          <button
            onClick={() => router.push("/officer/logout")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/20 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-300 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 rotate-180" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
          )}
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.length > 0 ? navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              }) : (
                <div className="text-gray-500 text-sm">Officer Portal</div>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 transition-colors py-2 px-2 rounded-lg"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                  {userInitial}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Officer</p>
                  <p className="text-xs text-gray-500">Civic Services</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => { router.push('/officer/profile'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => { router.push('/officer/logout'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
      </div>
    </RequireAuth>
  )
}
