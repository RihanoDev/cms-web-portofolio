import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'

export default function Login(){
  const nav = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string|null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const res = await api.post('/api/v1/auth/login', { email, password })
      const token = res?.data?.data?.token || res?.data?.token
      if(!token) throw new Error('Token missing')
      localStorage.setItem('cms_token', token)
      nav('/dashboard')
    }catch(err:any){
      setError(err?.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-slate-100">
      <form onSubmit={submit} className="bg-slate-800 p-8 rounded-xl w-full max-w-md shadow-xl">
        <h1 className="mt-0 mb-6 text-2xl font-semibold">CMS Login</h1>
  <label htmlFor="email" className="block mb-1 text-sm">Email</label>
  <input id="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
  <label htmlFor="password" className="block mt-4 mb-1 text-sm">Password</label>
  <input id="password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {error && <div className="text-red-400 mt-2 text-sm">{error}</div>}
        <button disabled={loading} className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 font-semibold">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
