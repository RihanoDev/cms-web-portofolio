import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const nav = useNavigate()
  React.useEffect(()=>{
    const token = localStorage.getItem('cms_token')
    if(!token){ nav('/') ; return }
  },[])

  const logout = () => {
    localStorage.removeItem('cms_token')
    nav('/')
  }

  const linkCls = ({ isActive }: {isActive: boolean}) => `block px-3 py-2 rounded-lg ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/60'}`

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800">
        <h1 className="m-0 text-xl font-semibold">Admin Dashboard</h1>
        <button onClick={logout} className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-400">Logout</button>
      </header>
      <div className="grid grid-cols-12 gap-0">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 p-4 bg-slate-800/60 space-y-2">
          <div className="text-xs uppercase text-slate-400 mb-2">Analytics</div>
          <NavLink to="." end className={linkCls}>Overview</NavLink>
          <div className="text-xs uppercase text-slate-400 mt-6 mb-2">Content</div>
          <NavLink to="profile" className={linkCls}>Profile</NavLink>
          <NavLink to="projects" className={linkCls}>Projects</NavLink>
          <NavLink to="articles" className={linkCls}>Articles</NavLink>
          <NavLink to="experiences" className={linkCls}>Experiences</NavLink>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
