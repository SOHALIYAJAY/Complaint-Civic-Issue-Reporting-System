'use client'

import { useState } from 'react'
import { ArrowLeft, BarChart3, PieChartIcon, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import CategoryComplaintsChart from '@/components/admin/categories/CategoryComplaintsChart'

export default function AnalyticsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Visualize complaint distribution across categories</p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Real-time Data</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <CategoryComplaintsChart />

      {/* Additional Analytics Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">About This Analytics</h3>
              <p className="text-sm text-gray-500">Understanding complaint patterns</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Bar Chart View</h4>
              <p className="text-sm text-gray-600 mt-1">
                Shows the exact number of complaints for each category, making it easy to compare volumes between categories.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Pie Chart View</h4>
              <p className="text-sm text-gray-600 mt-1">
                Displays the proportion of complaints each category represents, helping identify which areas need the most attention.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">Summary Statistics</h4>
              <p className="text-sm text-gray-600 mt-1">
                Provides key insights like highest category, total categories, and average complaints per category.
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
              <h3 className="text-lg font-semibold text-gray-900">Data Source</h3>
              <p className="text-sm text-gray-500">Backend API information</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">API Endpoint</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                /api/totalcategories/
              </code>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Update Frequency</span>
              <span className="text-sm font-medium text-gray-900">Real-time</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Data Format</span>
              <span className="text-sm font-medium text-gray-900">JSON</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
