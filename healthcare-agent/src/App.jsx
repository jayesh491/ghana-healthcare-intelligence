import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AgentChat from './pages/AgentChat'
import MedicalDeserts from './pages/MedicalDeserts'
import HospitalExplorer from './pages/HospitalExplorer'
import Anomalies from './pages/Anomalies'
import IDPDemo from './pages/IDPDemo'
import ResourcePlanner from './pages/ResourcePlanner'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'agent', label: 'AI Agent', icon: '🤖' },
  { id: 'deserts', label: 'Medical Deserts', icon: '🗺️' },
  { id: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { id: 'anomalies', label: 'Anomalies', icon: '🚨' },
  { id: 'idp', label: 'IDP', icon: '🧠' },
  { id: 'planner', label: 'Resource Planner', icon: '📋' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')

  // Check if already logged in
  useEffect(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) setUser(JSON.parse(savedUser))

  // Listen for navigation events from child pages
  const handleNav = (e) => setActivePage(e.detail)
  window.addEventListener('navigate', handleNav)
  return () => window.removeEventListener('navigate', handleNav)
}, [])

  const handleLogin = (userData) => setUser(userData)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Show login if not logged in
  if (!user) return <Login onLogin={handleLogin} />

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />
      case 'agent': return <AgentChat />
      case 'deserts': return <MedicalDeserts />
      case 'hospitals': return <HospitalExplorer />
      case 'anomalies': return <Anomalies />
      case 'idp': return <IDPDemo />
      case 'planner': return <ResourcePlanner />
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-white font-bold text-lg">🏥 Ghana Healthcare</h1>
          <p className="text-emerald-400 text-xs mt-1">Intelligence Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all text-sm font-medium
                ${activePage === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-white text-sm font-medium">👤 {user.name}</p>
            <p className="text-gray-500 text-xs truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-gray-500 hover:text-red-400 text-xs py-1.5 transition-colors"
          >
            Logout →
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {navItems.find(n => n.id === activePage)?.icon}{' '}
              {navItems.find(n => n.id === activePage)?.label}
            </h2>
            <p className="text-gray-500 text-sm">Ghana Healthcare Facility Intelligence</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-sm font-medium">Agent Online</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}