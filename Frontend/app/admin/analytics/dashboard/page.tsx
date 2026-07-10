'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { PieChartIcon, BarChart3, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react'

interface StatusData {
  name: string
  value: number
  color: string
}

interface MonthlyData {
  month: string
  complaints: number
}

const STATUS_COLORS = {
  'Pending': '#f59e0b',
  'In Progress': '#8b5cf6', 
  'Resolved': '#16a34a',
  'Rejected': '#ef4444'
}

const MONTH_NAMES = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May',
  6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October',
  11: 'November', 12: 'December'
}

export default function AnalyticsDashboard() {
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      
      // Fetch status data
      const statusResponse = await fetch(`${API_BASE}/api/complaintstatus/`)
      if (!statusResponse.ok) throw new Error('Failed to fetch status data')
      const statusResult = await statusResponse.json()
      
      console.log('Status data from backend:', statusResult)
      const formattedStatusData = Object.entries(statusResult).map(([status, count]) => ({
        name: status,
        value: count as number,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
      }))
      
      // Fetch monthly data
      const monthlyResponse = await fetch(`${API_BASE}/api/complaintmonthwise/`)
      if (!monthlyResponse.ok) throw new Error('Failed to fetch monthly data')
      const monthlyResult = await monthlyResponse.json()
      
      console.log('Monthly data from backend:', monthlyResult)
      const formattedMonthlyData = Object.entries(monthlyResult).map(([monthNum, count]) => ({
        month: MONTH_NAMES[parseInt(monthNum) as keyof typeof MONTH_NAMES] || `Month ${monthNum}`,
        complaints: count as number
      }))
      
      setStatusData(formattedStatusData)
      setMonthlyData(formattedMonthlyData)
      
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const totalComplaints = statusData.reduce((sum, item) => sum + item.value, 0)
  const totalMonthly = monthlyData.reduce((sum, item) => sum + item.complaints, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complaint Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time complaint status distribution and monthly trends
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{totalComplaints}</p>
              </div>
              <PieChartIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusData.find(s => s.name === 'Pending')?.value || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusData.find(s => s.name === 'In Progress')?.value || 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusData.find(s => s.name === 'Resolved')?.value || 0}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Complaint Status Distribution</h2>
              <p className="text-sm text-gray-500">Current status of all complaints</p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Status Summary */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {statusData.map((status) => (
                <div key={status.name} className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: status.color + '30', backgroundColor: status.color + '10' }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <span className="text-sm font-medium text-gray-700">{status.name}</span>
                  <span className="ml-auto text-sm font-bold text-gray-900">{status.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Monthly Complaint Trends</h2>
              <p className="text-sm text-gray-500">Complaints received per month</p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="complaints" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Monthly Summary */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Total Monthly Complaints</span>
                <span className="text-lg font-bold text-blue-900">{totalMonthly}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Highest Month</span>
                <span className="text-lg font-bold text-green-900">
                  {monthlyData.length > 0 
                    ? monthlyData.reduce((max, month) => month.complaints > max.complaints ? month : max).month
                    : 'N/A'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Monthly Average</span>
                <span className="text-lg font-bold text-purple-900">
                  {monthlyData.length > 0 
                    ? Math.round(totalMonthly / monthlyData.filter(m => m.complaints > 0).length || 1)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Data Sources</h3>
              <div className="flex gap-4 mt-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  /api/complaintstatus/
                </code>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  /api/complaintmonthwise/
                </code>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

