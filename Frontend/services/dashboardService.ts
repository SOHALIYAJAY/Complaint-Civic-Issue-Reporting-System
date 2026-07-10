import api from '../lib/axios'

export interface DashboardKPI {
  title: string
  value: string
  trend: string
  trendUp: boolean
  badge: string
  bgColor: string
  borderColor: string
  textColor: string
}

export interface BackendDashboardResponse {
  total_comp: number
  Pending_comp: number
  resolved_comp: number
  inprogress_comp: number
  sla_compliance: number
}

export const getDashboardKPIs = async (): Promise<DashboardKPI[]> => {
  try {
    const response = await api.get('/api/admindashboardcard/')
    const data: BackendDashboardResponse = response.data
    
    // Transform backend data to frontend KPI format
    const kpis: DashboardKPI[] = [
      { 
        title: 'Total Complaints', 
        value: (data.total_comp || 0).toString(), 
        trend: '+12%', 
        trendUp: true,
        badge: 'All Time',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-700'
      },
      { 
        title: 'Resolved Complaints', 
        value: (data.resolved_comp || 0).toString(), 
        trend: '+8%', 
        trendUp: true,
        badge: 'Completed',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-green-700'
      },
      { 
        title: 'Pending Complaints', 
        value: (data.Pending_comp || 0).toString(), 
        trend: '-5%', 
        trendUp: false,
        badge: 'Action Needed',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-700'
      },
      { 
        title: 'In Progress', 
        value: (data.inprogress_comp || 0).toString(), 
        trend: '+2%', 
        trendUp: true,
        badge: 'Working',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-700'
      }
    ]
    
    return kpis
  } catch (error: any) {
    console.error('Error fetching dashboard KPIs:', error)

    // On auth or network error, return an empty KPI list instead of hard-coded demo data
    if (error.response?.status === 401) {
      console.warn('Unauthorized while fetching dashboard KPIs, returning empty KPI list')
      return []
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      console.warn('Network error while fetching dashboard KPIs, returning empty KPI list')
      return []
    }

    throw error
  }
}

export const getDashboardStats = async (): Promise<BackendDashboardResponse> => {
  try {
    const response = await api.get('/api/admindashboardcard/')
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export const getRecentComplaints = async () => {
  try {
    const response = await api.get('/api/admin/dashboard/recent-complaints/')
    return response.data
  } catch (error) {
    console.error('Error fetching recent complaints:', error)
    throw error
  }
}

export const getDepartmentPerformance = async () => {
  try {
    const response = await api.get('/api/admin/dashboard/department-performance/')
    return response.data
  } catch (error) {
    console.error('Error fetching department performance:', error)
    throw error
  }
}

export const getMonthlyTrendData = async () => {
  try {
    const response = await api.get('/api/admin/dashboard/monthly-trends/')
    return response.data
  } catch (error) {
    console.error('Error fetching monthly trends:', error)
    throw error
  }
}

export const getDistrictData = async () => {
  try {
    const response = await api.get('/api/admin/dashboard/district-data/')
    return response.data
  } catch (error) {
    console.error('Error fetching district data:', error)
    throw error
  }
}

export const getUserMonthlyRegistrations = async () => {
  try {
    const response = await api.get('/api/user-registrations/monthly/')
    return response.data
  } catch (error) {
    console.error('Error fetching user monthly registrations:', error)
    throw error
  }
}

// Refresh all dashboard data
export const refreshDashboardData = async () => {
  try {
    const [kpis, stats] = await Promise.all([
      getDashboardKPIs(),
      getDashboardStats()
    ])
    
    return {
      kpis,
      stats
    }
  } catch (error) {
    console.error('Error refreshing dashboard data:', error)
    throw error
  }
}
