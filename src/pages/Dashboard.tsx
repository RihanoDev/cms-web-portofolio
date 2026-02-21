import React from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ContentStore } from '../services/content'

// Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
)

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
  </svg>
)

const ArticleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
  </svg>
)

const ExperienceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
)

export default function Dashboard(){
  const nav = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = React.useState(ContentStore.getProfile())
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  
  React.useEffect(() => {
    const token = localStorage.getItem('cms_token')
    if(!token){ nav('/') ; return }

    // Get profile
    const p = ContentStore.getProfile()
    setProfile(p)
  },[])

  const logout = () => {
    localStorage.removeItem('cms_token')
    nav('/')
  }

  // Get page title based on current location
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || ''
    switch(path) {
      case 'profile': return 'Profile'
      case 'projects': return 'Projects'
      case 'articles': return 'Articles'
      case 'experiences': return 'Experiences'
      default: return 'Overview'
    }
  }

  const linkCls = ({ isActive }: {isActive: boolean}) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
    ${isActive 
      ? 'bg-blue-600 text-white font-medium shadow-md' 
      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'}
  `

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-800 shadow-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} lg:translate-x-0`}>
        <div className="p-4 flex items-center justify-between h-20 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-navbar.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-lg shadow-md"
            />
            {!isCollapsed && <h1 className="text-xl font-bold text-white m-0">Rihano CMS</h1>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {/* Profile Section */}
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="relative group">
              <img 
                src={profile.avatarDataUrl || '/profile.jpg'} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
            </div>
            {!isCollapsed && (
              <div className="mt-3 text-center">
                <h3 className="font-medium text-white">{profile.name || 'Admin User'}</h3>
                <p className="text-xs text-slate-400">{profile.title || 'CMS Administrator'}</p>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {!isCollapsed && <div className="text-xs uppercase text-slate-400 mb-3 px-4">Dashboard</div>}
            <NavLink to="." end className={linkCls}>
              <HomeIcon />
              {!isCollapsed && <span>Overview</span>}
            </NavLink>
            
            {!isCollapsed && <div className="text-xs uppercase text-slate-400 mb-2 mt-6 px-4">Content</div>}
            <NavLink to="profile" className={linkCls}>
              <UserIcon />
              {!isCollapsed && <span>Profile</span>}
            </NavLink>
            <NavLink to="content-editors" className={linkCls}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              {!isCollapsed && <span>Content Editors</span>}
            </NavLink>
            <NavLink to="projects" className={linkCls}>
              <ProjectIcon />
              {!isCollapsed && <span>Projects</span>}
            </NavLink>
            <NavLink to="articles" className={linkCls}>
              <ArticleIcon />
              {!isCollapsed && <span>Articles</span>}
            </NavLink>
            <NavLink to="experiences" className={linkCls}>
              <ExperienceIcon />
              {!isCollapsed && <span>Experiences</span>}
            </NavLink>
          </nav>
        </div>
        
        {/* Logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-white bg-red-500 hover:bg-red-600 transition-colors rounded-lg shadow-md"
          >
            <LogoutIcon />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40 h-20 flex items-center justify-between px-8 shadow-md">
          <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm">
              Version 1.0
            </span>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
