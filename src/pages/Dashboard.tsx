import React from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ContentStore } from '../services/content'
import logoSite from '../assets/logo-site.png'

// ── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const UserIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const ProjectIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const ArticleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
)
const ExperienceIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const EditorIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)
const LogoutIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ── SidebarContent ─────────────────────────────────────────────────────────
function SidebarContent({
  profile,
  isCollapsed,
  linkCls,
  onLogout,
  onNavClick,
}: {
  profile: any
  isCollapsed: boolean
  linkCls: (p: { isActive: boolean }) => string
  onLogout: () => void
  onNavClick?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Profile */}
      <div className={`flex flex-col items-center py-4 px-3 border-b border-slate-700/80`}>
        <img
          src={profile.avatarDataUrl || '/profile.jpg'}
          alt="Profile"
          className={`rounded-full object-cover border-2 border-blue-500 shadow-md transition-all duration-300 ${isCollapsed ? 'w-9 h-9' : 'w-14 h-14'}`}
        />
        {!isCollapsed && (
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-white truncate max-w-[160px]">
              {profile.name || 'Admin User'}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[160px]">
              {profile.title || 'CMS Administrator'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-3">Dashboard</p>
        )}
        <NavLink to="." end className={linkCls} title="Overview" onClick={onNavClick}>
          <HomeIcon />
          {!isCollapsed && <span className="truncate">Overview</span>}
        </NavLink>

        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-5 mb-1 px-3">Content</p>
        )}
        {isCollapsed && <div className="my-2 border-t border-slate-700/60" />}

        <NavLink to="profile" className={linkCls} title="Profile" onClick={onNavClick}>
          <UserIcon />
          {!isCollapsed && <span className="truncate">Profile</span>}
        </NavLink>
        <NavLink to="content-editors" className={linkCls} title="Content Editors" onClick={onNavClick}>
          <EditorIcon />
          {!isCollapsed && <span className="truncate">Content Editors</span>}
        </NavLink>
        <NavLink to="projects" className={linkCls} title="Projects" onClick={onNavClick}>
          <ProjectIcon />
          {!isCollapsed && <span className="truncate">Projects</span>}
        </NavLink>
        <NavLink to="articles" className={linkCls} title="Articles" onClick={onNavClick}>
          <ArticleIcon />
          {!isCollapsed && <span className="truncate">Articles</span>}
        </NavLink>
        <NavLink to="experiences" className={linkCls} title="Experiences" onClick={onNavClick}>
          <ExperienceIcon />
          {!isCollapsed && <span className="truncate">Experiences</span>}
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/80">
        <button
          onClick={onLogout}
          title="Logout"
          className={`flex items-center justify-center gap-2 w-full py-2.5 text-white bg-red-500/80 hover:bg-red-600 transition-colors rounded-lg shadow-md ${isCollapsed ? 'px-0' : 'px-4'}`}
        >
          <LogoutIcon />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const nav = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = React.useState<any>({})
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem('cms_token')
    if (!token) { nav('/'); return }
    ContentStore.getProfile().then(p => setProfile(p))
  }, [])

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Show modal first, then confirm
  const requestLogout = () => setShowLogoutModal(true)

  const confirmLogout = () => {
    localStorage.removeItem('cms_token')
    setShowLogoutModal(false)
    nav('/')
  }

  const cancelLogout = () => setShowLogoutModal(false)

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || ''
    switch (path) {
      case 'profile': return 'Profile'
      case 'projects': return 'Projects'
      case 'articles': return 'Articles'
      case 'experiences': return 'Experiences'
      case 'content-editors': return 'Content Editors'
      default: return 'Overview'
    }
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg transition-all duration-150 ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
    } ${isActive
      ? 'bg-blue-600 text-white font-medium shadow-md'
      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
    }`

  // Mobile: always full labels
  const mobileLinkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg transition-all duration-150 px-4 py-3 ${isActive
      ? 'bg-blue-600 text-white font-medium shadow-md'
      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={cancelLogout}
        >
          <div
            className="bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeScale_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <LogoutIcon />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-lg font-bold text-white text-center mb-1">Konfirmasi Logout</h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              Apakah kamu yakin ingin keluar dari sesi ini?
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
              >
                <LogoutIcon />
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 shadow-2xl transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <img src={logoSite} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold text-white text-[15px]">Rihano CMS</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-700"
          >
            <XIcon />
          </button>
        </div>

        {/* Drawer content */}
        <div className="h-[calc(100%-4rem)] overflow-hidden">
          <SidebarContent
            profile={profile}
            isCollapsed={false}
            linkCls={mobileLinkCls}
            onLogout={requestLogout}
            onNavClick={() => setMobileOpen(false)}
          />
        </div>
      </aside>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-50 bg-slate-800 shadow-xl transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Desktop header */}
        <div className={`flex items-center h-16 border-b border-slate-700/80 px-3 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <img
              src={logoSite}
              alt="Rihano CMS"
              className={`rounded-lg object-contain flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-9 h-9'}`}
            />
            {!isCollapsed && (
              <span className="text-[15px] font-bold text-white truncate leading-tight">
                Rihano CMS
              </span>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex-shrink-0 text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-700 transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand floating button */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-[18px] z-10 bg-slate-700 hover:bg-blue-600 text-white p-1 rounded-full shadow-lg border border-slate-600 transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Desktop sidebar content */}
        <div className="flex-1 overflow-hidden">
          <SidebarContent
            profile={profile}
            isCollapsed={isCollapsed}
            linkCls={linkCls}
            onLogout={requestLogout}
          />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Topbar */}
        <header className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-8 shadow-md border-b border-slate-700/50">
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-700 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <h1 className="text-lg sm:text-xl font-bold">{getPageTitle()}</h1>
          </div>
          <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium hidden sm:inline-block">
            v1.0
          </span>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
