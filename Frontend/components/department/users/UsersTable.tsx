import React from 'react'
import { FileText } from 'lucide-react'

export default function UsersTable({ users, sortedUsers, handleViewProfile }: any) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-6 py-4 font-semibold text-slate-800">User ID</th>
            <th className="text-left px-6 py-4 font-semibold text-slate-800">Profile</th>
            <th className="text-left px-6 py-4 font-semibold text-slate-800">Email</th>
            <th className="text-left px-6 py-4 font-semibold text-slate-800">Phone</th>
            <th className="text-center px-6 py-4 font-semibold text-slate-800">Total</th>
            <th className="text-center px-6 py-4 font-semibold text-slate-800">Status</th>
            <th className="text-left px-6 py-4 font-semibold text-slate-800">Last Login</th>
            <th className="text-center px-6 py-4 font-semibold text-slate-800">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user: any) => (
            <tr key={user.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4 font-mono text-slate-700 font-semibold">{user.id}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{user.avatar}</div>
                  <span className="text-slate-900 font-medium">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700">{user.email}</td>
              <td className="px-6 py-4 text-slate-700">{user.phone}</td>
              <td className="px-6 py-4 text-center text-slate-900 font-semibold">{user.totalComplaints}</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-700">{user.lastLogin}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => handleViewProfile(user)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="View">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </button>
                  {/* Delete button removed - no longer available */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">Showing {sortedUsers.length} of {users.length} users</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium">Previous</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Next</button>
        </div>
      </div>
    </div>
  )
}
