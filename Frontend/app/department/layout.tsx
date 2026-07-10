"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
} from "lucide-react"
import RequireAuth from '@/components/auth/RequireAuth'

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/department" },
  { icon: FileText, label: "Assigned Complaints", path: "/department/assigned" },
  { icon: Users, label: "Officers", path: "/department/officers" },
  // { icon: Users, label: "Users", path: "/department/users" },
  { icon: User, label: "Profile", path: "/department/profile" },
]

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userInitial, setUserInitial] = useState('D')
  const [deptName, setDeptName] = useState('Department')
  const [deptCode, setDeptCode] = useState('')
  const [userName, setUserName] = useState('Department Head')
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const u = JSON.parse(userData)
        setUserInitial((u.username || u.first_name || 'D').charAt(0).toUpperCase())
        if (u.first_name || u.username)
          setUserName(u.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u.username)
      } catch {}
    }

    // Fetch real department name from dashboard API
    const token = localStorage.getItem('access_token')
    if (token && token !== 'undefined' && token !== 'null') {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      fetch(`${API_BASE}/api/department/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const name = data?.department?.category || data?.department?.name
          const code = data?.department?.code || ''
          if (name) { setDeptName(name); setDeptCode(code) }
        })
        .catch(() => {})
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    // Allow both Department and Admin users to open department pages
    <RequireAuth role={['Department-User', 'Admin-User']}>
      <div className="flex h-screen bg-[#F8FAFC]">
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
          ${sidebarOpen ? "w-52" : "w-1"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-primary text-primary-foreground transition-all duration-300 flex flex-col shadow-sm
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center border-b border-primary-foreground/20 px-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-primary-foreground truncate">CivicTrack</h1>
                <p className="text-xs text-primary-foreground/70 truncate">{deptName || 'Dept Head'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-xs relative ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary-foreground/70'}`} />
                {sidebarOpen && <span className="text-xs">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-2 py-2 border-t border-primary-foreground/20">
          <button
            onClick={() => router.push("/department/logout")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-red-400 hover:bg-red-400/20 transition-all font-medium text-xs"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-xs">Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-[#E2E8F0] rounded-full items-center justify-center shadow-sm hover:bg-[#F8FAFC] transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-3.5 h-3.5 text-[#64748B]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
          )}
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] shadow-sm flex items-center justify-between px-4 lg:px-6 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5 text-[#64748B]" /> : <Menu className="w-5 h-5 text-[#64748B]" />}
            </button>
            <div className="hidden sm:block">
              <h2 className="text-base font-semibold text-[#1E293B]">
                {deptName ? `${deptName} Department` : 'Department Portal'}
              </h2>
              <p className="text-xs text-[#64748B]">Head Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 pl-3 border-l border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors py-2 px-2 rounded-lg"
              >
                <div className="w-9 h-9 rounded-full bg-sidebar-primary text-white flex items-center justify-center font-semibold text-sm">
                  {userInitial}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#1E293B]">{userName}</p>
                  <p className="text-xs text-[#64748B] truncate max-w-[120px]">{deptName ? `${deptName} Dept` : 'Dept Head'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
                  <button
                    onClick={() => { router.push('/department/profile'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#64748B]" />
                    Profile
                  </button>
                  <div className="border-t border-[#E2E8F0] my-1" />
                  <button
                    onClick={() => { router.push('/department/logout'); setProfileDropdownOpen(false) }}
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
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">{children}</main>
      </div>
    </div>
    </RequireAuth>
  )
}

