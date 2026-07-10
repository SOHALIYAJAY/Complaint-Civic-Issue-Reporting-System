// Standardized color system for all KPI cards across the website
export const CARD_COLORS = {
  // Primary status colors
  total: {
    borderColor: 'border-t-[#1e3a5f]',
    iconBg: 'bg-[#eef1f7]',
    iconColor: 'text-[#1e3a5f]',
    progressLine: 'bg-[#1e3a5f]'
  },
  pending: {
    borderColor: 'border-t-[#f59e0b]',
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#f59e0b]',
    progressLine: 'bg-amber-500'
  },
  inProgress: {
    borderColor: 'border-t-indigo-500',
    iconBg: 'bg-[#eef1f7]',
    iconColor: 'text-[#1e3a5f]',
    progressLine: 'bg-indigo-500'
  },
  resolved: {
    borderColor: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    progressLine: 'bg-emerald-500'
  },
  
  // Secondary status colors
  escalated: {
    borderColor: 'border-t-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    progressLine: 'bg-red-500'
  },
  sla: {
    borderColor: 'border-t-violet-500',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    progressLine: 'bg-violet-500'
  },
  
  // User/Role colors
  users: {
    borderColor: 'border-t-[#1e3a5f]',
    iconBg: 'bg-[#eef1f7]',
    iconColor: 'text-[#1e3a5f]',
    progressLine: 'bg-[#1e3a5f]'
  },
  officers: {
    borderColor: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    progressLine: 'bg-emerald-500'
  },
  admins: {
    borderColor: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    progressLine: 'bg-amber-500'
  },
  
  // Performance colors
  high: {
    borderColor: 'border-t-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    progressLine: 'bg-red-500'
  },
  medium: {
    borderColor: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    progressLine: 'bg-amber-500'
  },
  low: {
    borderColor: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    progressLine: 'bg-emerald-500'
  }
}

// Helper function to get colors by card type
export function getCardColors(type: keyof typeof CARD_COLORS) {
  return CARD_COLORS[type] || CARD_COLORS.total
}
