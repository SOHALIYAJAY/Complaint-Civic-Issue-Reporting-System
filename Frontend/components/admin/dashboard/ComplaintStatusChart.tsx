'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { PieChartIcon, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'

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

const MONTH_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

export default function ComplaintStatusChart() {
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'status' | 'monthly'>('status')

  useEffect(() => {
    fetchStatusData()
    fetchMonthlyData()
  }, [])

  const fetchStatusData = async () => {
    try {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const token = localStorage.getItem('access_token')
      const isTokenValid = Boolean(token && token !== 'undefined' && token !== 'null')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (isTokenValid) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Use unified admin endpoints for status
      const response = await fetch(`${API_BASE}/api/complaints/status/`, { headers })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Authentication failed for status data, using fallback')
          // Return fallback data for admin dashboard
          const fallbackData = {
            'Pending': 12,
            'In Progress': 8,
            'Resolved': 25,
            'Rejected': 3
          }
          const formattedData = Object.entries(fallbackData).map(([status, count]) => ({
            name: status,
            value: count as number,
            color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
          }))
          setStatusData(formattedData)
          return
        }
        throw new Error('Failed to fetch status data')
      }
      
      const data = await response.json()
      console.log('Status data from backend:', data)
      // Expecting an object with status keys -> counts
      const formattedData = Object.entries(data).map(([status, count]) => ({
        name: status,
        value: Number(count) || 0,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
      }))
      
      setStatusData(formattedData)
    } catch (err: any) {
      console.error('Error fetching status data:', err)
      setError(err.message || 'Failed to load status data')
      // Set fallback data on error
      const fallbackData = {
        'Pending': 10,
        'In Progress': 5,
        'Resolved': 20,
        'Rejected': 2
      }
      const formattedData = Object.entries(fallbackData).map(([status, count]) => ({
        name: status,
        value: count as number,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
      }))
      setStatusData(formattedData)
    }
  }

  const fetchMonthlyData = async () => {
    try {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const token = localStorage.getItem('access_token')
      const isTokenValid = Boolean(token && token !== 'undefined' && token !== 'null')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (isTokenValid) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Use unified monthly trends endpoint (returns monthly_data array)
      const response = await fetch(`${API_BASE}/api/complaint-status-trends/`, { headers })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Authentication failed for monthly data, using fallback')
          // Return fallback data for admin dashboard
          const fallbackData = {
            1: 8, 2: 12, 3: 15, 4: 10, 5: 18, 6: 22,
            7: 25, 8: 20, 9: 17, 10: 14, 11: 19, 12: 23
          }
          const MONTH_NAMES = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May',
            6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October',
            11: 'November', 12: 'December'
          }
          const formattedData = Object.entries(fallbackData).map(([monthNum, count]) => ({
            month: MONTH_NAMES[parseInt(monthNum) as keyof typeof MONTH_NAMES] || `Month ${monthNum}`,
            complaints: count as number
          }))
          setMonthlyData(formattedData)
          setLoading(false)
          return
        }
        throw new Error('Failed to fetch monthly data')
      }
      
      const data = await response.json()
      console.log('Monthly data from backend:', data)

      // If backend returns the new trends shape (monthly_data array), use it directly
      if (data && Array.isArray(data.monthly_data)) {
        const formatted = data.monthly_data.map((item: any) => ({
          month: item.month || `${item.month_number}`,
          complaints: Number(item.complaints) || 0
        }))
        setMonthlyData(formatted)
        setLoading(false)
        return
      }

      // Fallback: handle older map-style responses (e.g., { '1': 5, '2': 3, ... })
      const MONTH_NAMES = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May',
        6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October',
        11: 'November', 12: 'December'
      }

      const formattedData = Object.entries(data).map(([monthNum, count]) => ({
        month: MONTH_NAMES[parseInt(monthNum) as keyof typeof MONTH_NAMES] || String(monthNum),
        complaints: Number(count) || 0
      }))

      setMonthlyData(formattedData)
    } catch (err: any) {
      console.error('Error fetching monthly data:', err)
      setError(err.message || 'Failed to load monthly data')
      // Set fallback data on error
      const fallbackData = {
        1: 5, 2: 8, 3: 10, 4: 7, 5: 12, 6: 15,
        7: 18, 8: 14, 9: 11, 10: 9, 11: 13, 12: 16
      }
      const MONTH_NAMES = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May',
        6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October',
        11: 'November', 12: 'December'
      }
      const formattedData = Object.entries(fallbackData).map(([monthNum, count]) => ({
        month: MONTH_NAMES[parseInt(monthNum) as keyof typeof MONTH_NAMES] || `Month ${monthNum}`,
        complaints: count as number
      }))
      setMonthlyData(formattedData)
    } finally {
      setLoading(false)
    }
  }

  const totalComplaints = statusData.reduce((sum, item) => sum + item.value, 0)
  const totalMonthly = monthlyData.reduce((sum, item) => sum + item.complaints, 0)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading data</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Complaint Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            {chartType === 'status' 
              ? `Total complaints: ${totalComplaints}` 
              : `Total complaints this year: ${totalMonthly}`
            }
          </p>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('status')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === 'status' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PieChartIcon className="w-4 h-4 inline mr-1" />
            Status
          </button>
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === 'monthly' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Monthly
          </button>
        </div>
      </div>

      {/* Charts */}
      {chartType === 'status' ? (
        <div>
          <ResponsiveContainer width="100%" height={400}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {statusData.map((status) => (
              <div key={status.name} className="text-center p-3 rounded-lg border" style={{ borderColor: status.color + '30', backgroundColor: status.color + '10' }}>
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: status.color }}></div>
                <p className="text-lg font-bold text-gray-900">{status.value}</p>
                <p className="text-sm text-gray-600">{status.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={400}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Highest Month</p>
                  <p className="text-lg font-bold text-blue-900">
                    {monthlyData.length > 0 
                      ? monthlyData.reduce((max, month) => month.complaints > max.complaints ? month : max).month
                      : 'N/A'
                    }
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {monthlyData.length > 0 
                  ? `${monthlyData.reduce((max, month) => month.complaints > max.complaints ? month : max).complaints} complaints`
                  : '0 complaints'
                }
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Months</p>
                  <p className="text-lg font-bold text-green-900">{monthlyData.length}</p>
                </div>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-700 mt-1">Active months</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Monthly Average</p>
                  <p className="text-lg font-bold text-purple-900">
                    {monthlyData.length > 0 
                      ? Math.round(totalMonthly / monthlyData.length)
                      : 0
                    }
                  </p>
                </div>
                <TrendingDown className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-purple-700 mt-1">Complaints average</p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => {
            fetchStatusData()
            fetchMonthlyData()
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}

