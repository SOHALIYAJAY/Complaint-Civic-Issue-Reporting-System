'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DistributionData {
  name: string
  value: number
  color: string
}

interface ChartData {
  priority_distribution: DistributionData[]
  status_distribution: DistributionData[]
  monthly_trends: Array<{ month: string; complaints: number }>
}

export default function ComplaintDistributionChart() {
  const [chartData, setChartData] = useState<ChartData>({
    priority_distribution: [],
    status_distribution: [],
    monthly_trends: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'priority' | 'status' | 'trends'>('priority')

  useEffect(() => {
    async function fetchChartData() {
      try {
        const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
        const token = localStorage.getItem('access_token')
        
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }

        const response = await fetch(`${API_BASE}/api/complaint-priority-distribution/`, { headers })
        const data = await response.json()
        
        setChartData(data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Complaint Distribution</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('priority')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              activeTab === 'priority'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              activeTab === 'trends'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Priority Distribution */}
      {activeTab === 'priority' && (
        <div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.priority_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.priority_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {chartData.priority_distribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Distribution */}
      {activeTab === 'status' && (
        <div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData.status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Complaints']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {chartData.status_distribution.map((item, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-3 h-3 rounded-full mx-auto mb-2" 
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {activeTab === 'trends' && (
        <div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Bar 
                  dataKey="complaints" 
                  fill="#3B82F6" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">Monthly complaint trends over the last 6 months</p>
          </div>
        </div>
      )}
    </div>
  )
}

