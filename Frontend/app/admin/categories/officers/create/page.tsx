"use client"

import { useState } from "react"
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'

export default function CreateOfficerPage(){
  const [officerId, setOfficerId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validate = () => {
    if (!officerId.trim()) return 'Officer ID is required'
    if (!name.trim()) return 'Name is required'
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Valid email is required'
    if (!phone.trim()) return 'Phone is required'
    if (!password.trim() || password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) return setError(v)
    setSubmitting(true)
    try{
      const payload = {
        officer_id: officerId,
        name,
        email,
        phone,
        password,
        is_available: isAvailable
      }
      const res = await api.post('/api/create-officer/', payload)
      // navigate back to officers list
      router.push('/department/officers')
    }catch(err:any){
      console.error('Create officer error', err)
      const msg = err?.response?.data || err?.message || 'Failed to create officer'
      // show first serializer error if present
      if (typeof msg === 'object'){
        const first = Object.entries(msg)[0]
        setError(`${first[0]}: ${JSON.stringify(first[1])}`)
      } else setError(String(msg))
    }finally{ setSubmitting(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Officer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-6">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Officer ID</label>
          <input value={officerId} onChange={e=>setOfficerId(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="avail" type="checkbox" checked={isAvailable} onChange={e=>setIsAvailable(e.target.checked)} />
          <label htmlFor="avail" className="text-sm text-slate-700">Available</label>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#7c3aed] text-white rounded disabled:opacity-60">{submitting ? 'Creating...' : 'Create Officer'}</button>
        </div>
      </form>
    </div>
  )
}
