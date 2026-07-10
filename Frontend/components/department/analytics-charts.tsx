"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from "recharts"

/* ── Status pie data ── */
const statusData = [
  { name: "Pending", value: 186, color: "#f59e0b" },
  { name: "In Progress", value: 342, color: "#3b82f6" },
  { name: "Resolved", value: 674, color: "#16a34a" },
  { name: "Escalated", value: 46, color: "#dc2626" },
]

/* ── Monthly trend ── */
const monthlyData = [
  { month: "Sep", complaints: 98, resolved: 72 },
  { month: "Oct", complaints: 114, resolved: 91 },
  { month: "Nov", complaints: 132, resolved: 108 },
  { month: "Dec", complaints: 120, resolved: 102 },
  { month: "Jan", complaints: 145, resolved: 118 },
  { month: "Feb", complaints: 128, resolved: 112 },
]

/* ── Officer performance ── */
const officerData = [
  { name: "R. Kumar", resolved: 142, pending: 18, compliance: 96 },
  { name: "P. Sharma", resolved: 118, pending: 24, compliance: 91 },
  { name: "A. Patel", resolved: 95, pending: 12, compliance: 94 },
  { name: "N. Singh", resolved: 88, pending: 22, compliance: 87 },
  { name: "V. Desai", resolved: 76, pending: 15, compliance: 92 },
]

/* ── SLA compliance trend ── */
const slaData = [
  { month: "Sep", compliance: 88 },
  { month: "Oct", compliance: 89 },
  { month: "Nov", compliance: 91 },
  { month: "Dec", compliance: 90 },
  { month: "Jan", compliance: 92 },
  { month: "Feb", compliance: 91.4 },
]

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">{title}</h4>
      {children}
    </div>
  )
}

export default function DeptAnalytics() {
  const maxComplaints = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => Number(d.complaints || 0))) : 0
  const chartYAxisMax = Math.max(Math.ceil(maxComplaints * 1.2), 5)
  const adaptiveBarSize = monthlyData.length > 8 ? 18 : 22
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Status Pie */}
      <ChartCard title="Complaint Status Distribution">
        <div className="flex items-center gap-4">
          <div className="w-[180px] h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-slate-600 flex-1">{s.name}</span>
                <span className="text-xs font-semibold text-slate-800">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Monthly trend */}
      <ChartCard title="Monthly Complaint Trend">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData} barCategoryGap="20%" margin={{ bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              domain={[0, chartYAxisMax]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="complaints" fill="#1e40af" barSize={adaptiveBarSize} radius={[6, 6, 0, 0]} name="Received" />
            <Bar dataKey="resolved" fill="#16a34a" barSize={adaptiveBarSize} radius={[6, 6, 0, 0]} name="Resolved" />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Officer performance bar */}
      <ChartCard title="Officer Performance Comparison">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={officerData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="resolved" fill="#1e40af" radius={[4, 4, 0, 0]} name="Resolved" />
            <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* SLA compliance area */}
      <ChartCard title="SLA Compliance Trend (%)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={slaData}>
            <defs>
              <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              domain={[80, 100]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Compliance"]}
            />
            <Area
              type="monotone"
              dataKey="compliance"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#slaGrad)"
              dot={{ fill: "#7c3aed", r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
