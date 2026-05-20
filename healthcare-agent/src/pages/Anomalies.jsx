import { useState, useEffect } from 'react'

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAnomalies()
  }, [])

  const fetchAnomalies = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://ghana-healthcare-intelligence.onrender.com/api/anomalies')
      const data = await res.json()
      setAnomalies(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const filtered = filter === 'all' ? anomalies
    : anomalies.filter(a => a.severity === filter)

  const severityStyle = (s) => ({
    high: 'bg-red-900/30 text-red-400 border-red-800',
    medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    low: 'bg-blue-900/30 text-blue-400 border-blue-800',
  }[s] || 'bg-gray-800 text-gray-400 border-gray-700')

  return (
    <div className="space-y-6">

      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'High Severity', color: 'red', icon: '🔴', key: 'high' },
          { label: 'Medium Severity', color: 'yellow', icon: '🟡', key: 'medium' },
          { label: 'Low Severity', color: 'blue', icon: '🔵', key: 'low' },
        ].map(s => (
          <div key={s.key} className={`bg-gray-900 border rounded-xl p-4
            ${s.color === 'red' ? 'border-red-800' : s.color === 'yellow' ? 'border-yellow-800' : 'border-blue-800'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-white text-2xl font-bold">
                  {anomalies.filter(a => a.severity === s.key).length}
                </p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Suspicious Hospital Records</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Facilities with inconsistent or incomplete data
            </p>
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors
                  ${filter === f ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-3">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-gray-500 text-sm">Scanning 987 hospital records...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map((a, i) => (
              <div key={i} className="p-5 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-medium">{a.hospital}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${severityStyle(a.severity)}`}>
                        {a.severity} severity
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-3">
                      📍 {a.city}, {a.region}
                    </p>
                    <div className="space-y-1.5">
                      {a.issues.map((issue, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-yellow-500 text-xs mt-0.5">⚠️</span>
                          <p className="text-gray-400 text-xs">{issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-600 text-xs">Completeness</p>
                    <p className={`text-lg font-bold
                      ${a.completeness >= 70 ? 'text-emerald-400' : a.completeness >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {a.completeness}%
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No anomalies found for this filter
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
