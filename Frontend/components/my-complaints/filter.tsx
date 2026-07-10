'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface ComplaintsFilterProps {
  filterStatus: string
  setFilterStatus: (s: string) => void
  searchTerm: string
  setSearchTerm: (s: string) => void
  categoryFilter: string
  setCategoryFilter: (s: string) => void
  priorityFilter: string
  setPriorityFilter: (s: string) => void
}

const STATUS_OPTS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Process', label: 'In Progress' },
  { value: 'Completed', label: 'Resolved' },
]

const PRIORITY_OPTS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

export default function ComplaintsFilter({
  filterStatus, setFilterStatus,
  searchTerm, setSearchTerm,
  categoryFilter, setCategoryFilter,
  priorityFilter, setPriorityFilter,
}: ComplaintsFilterProps) {
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE}/api/categorieslist/`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (mounted) setCategories(Array.isArray(d) ? d : []) })
      .catch(() => {})
    return () => { mounted = false }
  }, [API_BASE])

  const hasActiveFilters = filterStatus !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || searchTerm !== ''

  const resetAll = () => {
    setSearchTerm(''); setFilterStatus('all'); setCategoryFilter('all'); setPriorityFilter('all')
  }

  const selectClass = "h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"

  return (
    <section className="py-5 border-b border-border bg-muted/20 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Main filter row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass}>
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={selectClass}>
              <option value="all">All Categories</option>
              {categories.length > 0
                ? categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                : <>
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Street Lighting">Street Lighting</option>
                    <option value="Drainage">Drainage</option>
                  </>
              }
            </select>

            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={selectClass}>
              {PRIORITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {hasActiveFilters && (
              <Button size="sm" variant="ghost" onClick={resetAll} className="h-9 gap-1.5 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {filterStatus} <button onClick={() => setFilterStatus('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {categoryFilter} <button onClick={() => setCategoryFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {priorityFilter} priority <button onClick={() => setPriorityFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

