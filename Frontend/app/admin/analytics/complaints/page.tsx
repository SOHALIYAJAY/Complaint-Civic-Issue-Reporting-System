'use client'

import { useState } from 'react'
import { ArrowLeft, BarChart3, PieChartIcon, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import ComplaintStatusChart from '@/components/admin/dashboard/ComplaintStatusChart'

export default function ComplaintAnalyticsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaint Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive analysis of complaint patterns and trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Real-time Analytics</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <ComplaintStatusChart />

      {/* Additional Analytics Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-500">Complaint status breakdown</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Pie Chart View</h4>
              <p className="text-sm text-gray-600 mt-1">
                Visual representation of complaint status distribution showing pending, in-progress, and resolved complaints.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Status Indicators</h4>
              <p className="text-sm text-gray-600 mt-1">
                Color-coded status cards provide quick insights into complaint resolution rates.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
              <p className="text-sm text-gray-500">Time-based analysis</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">Bar Chart Analysis</h4>
              <p className="text-sm text-gray-600 mt-1">
                Monthly complaint trends help identify seasonal patterns and resource allocation needs.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium text-gray-900">Statistical Insights</h4>
              <p className="text-sm text-gray-600 mt-1">
                Average, peak, and trend analysis for better planning and forecasting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
            <p className="text-sm text-gray-500">Important metrics for monitoring</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Resolution Rate</h4>
            <p className="text-2xl font-bold text-blue-900">Calculating...</p>
            <p className="text-xs text-blue-600 mt-1">Based on current data</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-sm font-medium text-green-700 mb-2">Avg Resolution Time</h4>
            <p className="text-2xl font-bold text-green-900">Calculating...</p>
            <p className="text-xs text-green-600 mt-1">Based on current data</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="text-sm font-medium text-orange-700 mb-2">Peak Month</h4>
            <p className="text-2xl font-bold text-orange-900">Calculating...</p>
            <p className="text-xs text-orange-600 mt-1">Based on current data</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="text-sm font-medium text-purple-700 mb-2">Active Categories</h4>
            <p className="text-2xl font-bold text-purple-900">Calculating...</p>
            <p className="text-xs text-purple-600 mt-1">Based on current data</p>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
            <p className="text-sm text-gray-500">Backend API information</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Status API</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                /api/complaintstatus/
              </code>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Monthly API</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                /api/complaintmonthwise/
              </code>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Update Frequency</span>
              <span className="text-sm font-medium text-gray-900">Real-time</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Data Format</span>
              <span className="text-sm font-medium text-gray-900">JSON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
