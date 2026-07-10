import React from 'react'
import { Mail, Phone, MapPin, Calendar, Clock, RotateCcw, Lock } from 'lucide-react'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'

export default function UserProfileModal({ showModal, selectedUser, onClose }: any) {
  if (!showModal || !selectedUser) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-bold text-blue-900">User Profile</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 text-2xl font-bold">×</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Full Name</p>
              <p className="text-lg font-semibold text-slate-900">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">User ID</p>
              <p className="text-lg font-semibold text-slate-900">{selectedUser.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4"/>{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Phone</p>
              <p className="text-sm text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4"/>{selectedUser.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm text-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4"/>{selectedUser.address}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Role</p>
                <p className="text-sm font-semibold text-slate-900">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${selectedUser.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedUser.status}</span>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Registration Date</p>
                <p className="text-sm text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4"/>{selectedUser.registrationDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Last Login</p>
                <p className="text-sm text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4"/>{selectedUser.lastLogin}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Complaint History Summary</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Total Complaints</p>
                <p className="text-2xl font-bold text-slate-900">{selectedUser.totalComplaints}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Open Complaints</p>
                <p className="text-2xl font-bold text-orange-600">{selectedUser.openComplaints}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{selectedUser.totalComplaints - selectedUser.openComplaints}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={selectedUser.complaintHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {selectedUser.activityTimeline.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4"/>Reset Password</button>
            <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"><Lock className="w-4 h-4"/>Block User</button>
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
