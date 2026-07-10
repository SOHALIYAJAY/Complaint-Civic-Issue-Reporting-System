'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon, Activity, Calendar, Filter, RefreshCw } from 'lucide-react'

interface ChartData {
  category: string
  complaints: number
}

interface MonthlyData {
  month: string
  complaints: number
  categories: { [key: string]: number }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

export default function CategoryComplaintsChart() {
  // Backend returns: [{ name: string, total_comp: number }, ...]
  const [data, setData] = useState<Array<{ name: string; total_comp: number }>>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area'>('bar')
  const [timeRange, setTimeRange] = useState<'all' | '6months' | '3months'>('all')

  useEffect(() => {
    fetchCategoryComplaints()
    fetchMonthlyTrends()
  }, [])

  const fetchCategoryComplaints = async () => {
    try {
      setLoading(true)
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      
      console.log('Fetching from:', `${API_BASE}/api/totalcategories/`)
      const response = await fetch(`${API_BASE}/api/totalcategories/`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      setData(Array.isArray(result) ? result : [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching category complaints:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyTrends = async () => {
    try {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      
      // Mock monthly data for now - you can create a real endpoint
      const mockMonthlyData: MonthlyData[] = [
        { month: 'Jan', complaints: 45, categories: { 'Roads': 15, 'Water': 12, 'Sanitation': 8, 'Electricity': 10 } },
        { month: 'Feb', complaints: 52, categories: { 'Roads': 18, 'Water': 14, 'Sanitation': 10, 'Electricity': 10 } },
        { month: 'Mar', complaints: 48, categories: { 'Roads': 16, 'Water': 13, 'Sanitation': 9, 'Electricity': 10 } },
        { month: 'Apr', complaints: 61, categories: { 'Roads': 20, 'Water': 16, 'Sanitation': 12, 'Electricity': 13 } },
        { month: 'May', complaints: 55, categories: { 'Roads': 18, 'Water': 15, 'Sanitation': 11, 'Electricity': 11 } },
        { month: 'Jun', complaints: 67, categories: { 'Roads': 22, 'Water': 18, 'Sanitation': 14, 'Electricity': 13 } }
      ]
      
      setMonthlyData(mockMonthlyData)
    } catch (err: any) {
      console.error('Error fetching monthly trends:', err)
    }
  }

  // Convert data to chart format
  const getChartData = (): ChartData[] => {
    return data
      .filter((item) => (item?.total_comp || 0) > 0)
      .map((item) => ({
        category: (item.name || '').replace(/_/g, ' ').toUpperCase(),
        complaints: item.total_comp || 0,
      }))
      .sort((a, b) => b.complaints - a.complaints)
  }

  // Get top categories for line chart
  const getTopCategories = (): string[] => {
    return getChartData().slice(0, 5).map(d => d.category)
  }

  // Prepare line chart data
  const getLineChartData = () => {
    const topCategories = getTopCategories()
    return monthlyData.map(month => {
      const dataPoint: any = { month: month.month }
      topCategories.forEach(cat => {
        dataPoint[cat] = month.categories[cat] || 0
      })
      return dataPoint
    })
  }

  const chartData = getChartData()
  const lineChartData = getLineChartData()
  const totalComplaints = data.reduce((sum, item) => sum + (item.total_comp || 0), 0)

  console.log('Processed chart data:', chartData)
  console.log('Total complaints:', totalComplaints)

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

  if (error || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {error ? 'Error loading data' : 'No complaint data available'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {error ? error : 'Categories will appear here once complaints are registered'}
          </p>
          {error && (
            <button 
              onClick={fetchCategoryComplaints}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Category Distribution Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complaints by Category</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total complaints: <span className="font-semibold text-gray-700">{totalComplaints}</span>
            </p>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Bar
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'pie' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <PieChartIcon className="w-4 h-4 inline mr-1" />
                Pie
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'area' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-1" />
                Area
              </button>
            </div>
            
            <button 
              onClick={fetchCategoryComplaints}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Charts */}
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
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
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, complaints, percent }) => 
                  `${category}: ${complaints} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="complaints"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
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
              <Area 
                type="monotone" 
                dataKey="complaints" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Highest Category</p>
                <p className="text-lg font-bold text-blue-900">
                  {chartData[0]?.category || 'N/A'}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {chartData[0]?.complaints || 0} complaints
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Categories</p>
                <p className="text-lg font-bold text-green-900">{chartData.length}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-green-700 mt-1">Active categories</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Average per Category</p>
                <p className="text-lg font-bold text-purple-900">
                  {chartData.length > 0 ? Math.round(totalComplaints / chartData.length) : 0}
                </p>
              </div>
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 mt-1">Complaints average</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Lowest Category</p>
                <p className="text-lg font-bold text-orange-900">
                  {chartData[chartData.length - 1]?.category || 'N/A'}
                </p>
              </div>
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700 mt-1">
              {chartData[chartData.length - 1]?.complaints || 0} complaints
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

