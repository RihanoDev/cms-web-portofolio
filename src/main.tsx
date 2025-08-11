import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Overview from './pages/Overview'
import ProfileEditor from './pages/ProfileEditor'
import ProjectsEditor from './pages/ProjectsEditor'
import ArticlesEditor from './pages/ArticlesEditor'
import ExperiencesEditor from './pages/ExperiencesEditor'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Login /> },
    { path: 'dashboard', element: <Dashboard />, children: [
      { index: true, element: <Overview /> },
      { path: 'profile', element: <ProfileEditor /> },
      { path: 'projects', element: <ProjectsEditor /> },
      { path: 'articles', element: <ArticlesEditor /> },
      { path: 'experiences', element: <ExperiencesEditor /> },
    ] },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
