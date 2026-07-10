"use client"

import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { TrendingUp, Users, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface StatusData {
  open: number
  in_progress: number
  resolved: number
  pending: number
}

interface MonthlyData {
  [key: string]: number
}

interface ChartSummary {
  average: number
  peak_month: string
  peak_count: number
  total: number
}

type TrendView = 'monthly' | 'yearly'

export default function DashboardCharts() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [summary, setSummary] = useState<ChartSummary | null>(null)
  const [trendView, setTrendView] = useState<TrendView>('monthly')
  const [loading, setLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatusData = async () => {
    try {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const response = await fetch(`${API_BASE}/api/complaints/status/`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      setStatusData(await response.json())
    } catch (error) {
      console.error('Error fetching status data:', error)
      setError('Failed to load complaint status data')
    }
  }

  const fetchTrendData = async (view: TrendView) => {
    try {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const token = localStorage.getItem('adminToken') || localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE}/api/complaint-status-trends/?view=${view}`, { headers })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()

      let map: MonthlyData = {}
      if (view === 'yearly' && Array.isArray(data.yearly_data)) {
        data.yearly_data.forEach((item: any) => { map[item.year] = Number(item.complaints) || 0 })
      } else if (Array.isArray(data.monthly_data)) {
        data.monthly_data.forEach((item: any) => { map[item.month] = Number(item.complaints) || 0 })
      } else {
        map = data && typeof data === 'object' ? data : {}
      }

      setMonthlyData(map)
      const keys = Object.keys(map)
      const values = Object.values(map)
      const total = values.reduce((s, v) => s + v, 0)
      const average = keys.length ? Math.round(total / keys.length) : 0
      const maxIndex = values.indexOf(Math.max(...values))
      setSummary({ average, peak_month: keys[maxIndex] || '', peak_count: values[maxIndex] || 0, total })
    } catch (error) {
      console.error('Error fetching trend data:', error)
      setError('Failed to load complaint trend data')
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchStatusData(), fetchTrendData(trendView)])
    setLoading(false)
  }

  const handleViewChange = async (view: TrendView) => {
    setTrendView(view)
    setTrendLoading(true)
    await fetchTrendData(view)
    setTrendLoading(false)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const donutChartData = statusData ? {
    labels: ['Open', 'In Progress', 'Resolved', 'Pending'],
    datasets: [{
      data: [statusData.open, statusData.in_progress, statusData.resolved, statusData.pending],
      backgroundColor: ['#3B82F6', '#F97316', '#10B981', '#8B5CF6'],
      borderColor: ['#2563EB', '#EA580C', '#059669', '#7C3AED'],
      borderWidth: 2,
      hoverOffset: 4
    }]
  } : null

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 15, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
            return `${context.label}: ${value} (${((value / total) * 100).toFixed(1)}%)`
          }
        }
      }
    },
    cutout: '60%',
    animation: { animateScale: true, animateRotate: true }
  }

  const barChartData = monthlyData ? {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: trendView === 'yearly' ? 'Yearly Complaints' : 'Monthly Complaints',
      data: Object.values(monthlyData),
      backgroundColor: trendView === 'yearly' ? '#8B5CF6' : '#3B82F6',
      borderColor: trendView === 'yearly' ? '#7C3AED' : '#2563EB',
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: trendView === 'yearly' ? '#7C3AED' : '#2563EB'
    }]
  } : null

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8 }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    },
    animation: { duration: 1000, easing: 'easeInOutQuart' as const }
  }

  const totalComplaints = statusData ?
    statusData.open + statusData.in_progress + statusData.resolved + statusData.pending : 0

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-center"><div className="w-64 h-64 bg-gray-200 rounded-full"></div></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Loading Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Complaint Status Distribution</h3>
            <div className="p-2 bg-blue-50 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
          </div>
          <div className="relative">
            {donutChartData && (
              <div className="relative h-80">
                <Doughnut data={donutChartData} options={donutOptions} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{totalComplaints}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {statusData && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-sm text-gray-600">Open: {statusData.open}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-sm text-gray-600">In Progress: {statusData.in_progress}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-sm text-gray-600">Resolved: {statusData.resolved}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-sm text-gray-600">Pending: {statusData.pending}</span></div>
            </div>
          )}
        </div>

        {/* Bar Chart - Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {trendView === 'yearly' ? 'Yearly Complaint Trends' : 'Monthly Complaint Trend'}
            </h3>
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => handleViewChange('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                trendView === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleViewChange('yearly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                trendView === 'yearly' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="h-64 relative">
            {trendLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg z-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {barChartData && <Bar data={barChartData} options={barOptions} />}
          </div>

          {summary && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Average</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.average}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">{trendView === 'yearly' ? 'Peak Year' : 'Peak Month'}</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.peak_month}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Total</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.total}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>Auto-refreshing every 30 seconds</span>
      </div>
    </div>
  )
}

