import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function App() {
  const navigate = useNavigate()
  React.useEffect(()=>{
    const token = localStorage.getItem('cms_token')
    if (token) navigate('/dashboard')
  },[])
  return <Outlet />
}
