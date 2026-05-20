import { useState } from 'react'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    setLoading(true)

    const url = isRegister ? '/api/register' : '/api/login'
    const body = isRegister
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password }

    try {
      const res = await fetch(`https://ghana-healthcare-intelligence.onrender.com${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Something went wrong')
        setLoading(false)
        return
      }

      if (isRegister) {
        setIsRegister(false)
        setError('')
        setForm({ name: '', email: '', password: '' })
        alert('Account created! Please login.')
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-white text-2xl font-bold">Ghana Healthcare</h1>
          <p className="text-emerald-400 text-sm mt-1">Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6">
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handle}
                  placeholder="John Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && submit()}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login →'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => { setIsRegister(!isRegister); setError('') }}
                className="text-emerald-400 hover:text-emerald-300 ml-1.5 font-medium"
              >
                {isRegister ? 'Login' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Virtue Foundation × Databricks Hackathon 2026
        </p>
      </div>
    </div>
  )
}
