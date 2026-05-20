import { useState } from 'react'

const regions = [
  "Greater Accra", "Ashanti", "Central", "Northern",
  "Upper West", "Upper East", "Volta", "Western",
  "Eastern", "Brong-Ahafo"
]

const doctorTypes = [
  { id: 'emergency', label: 'Emergency Physician', icon: '🚨', needed: ['Northern', 'Upper West', 'Upper East'] },
  { id: 'surgeon', label: 'General Surgeon', icon: '🔪', needed: ['Upper West', 'Upper East', 'Volta'] },
  { id: 'gynecologist', label: 'Gynecologist/OB', icon: '👶', needed: ['Northern', 'Central', 'Volta'] },
  { id: 'pediatrician', label: 'Pediatrician', icon: '🧒', needed: ['Upper West', 'Upper East', 'Northern'] },
  { id: 'internist', label: 'Internal Medicine', icon: '🩺', needed: ['Brong-Ahafo', 'Eastern'] },
]

export default function ResourcePlanner() {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedDoctors, setSelectedDoctors] = useState([])
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const toggleDoctor = (id) => {
    setSelectedDoctors(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const generatePlan = async () => {
    if (!selectedRegion || selectedDoctors.length === 0) return
    setLoading(true)
    setPlan(null)

    try {
      const token = localStorage.getItem('token')
      const question = `Create a detailed resource deployment plan for ${selectedRegion} region in Ghana. 
      Available resources to deploy: ${selectedDoctors.join(', ')}. 
      Include: 1) Top 3 priority hospitals to send these doctors to, 2) Expected patient impact, 
      3) Timeline recommendation, 4) Any risks or considerations.
      Be specific with hospital names and numbers from Ghana data.`

      const res = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      setPlan(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
    setStep(3)
  }

  const getUrgency = (region) => {
    const critical = ['Upper West', 'Upper East', 'Northern']
    const warning = ['Central', 'Volta', 'Brong-Ahafo']
    if (critical.includes(region)) return { label: 'Critical', color: 'red' }
    if (warning.includes(region)) return { label: 'Warning', color: 'yellow' }
    return { label: 'Moderate', color: 'blue' }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 border border-blue-800/50 rounded-xl p-6">
        <h2 className="text-white font-bold text-xl mb-1">
          📋 Resource Deployment Planner
        </h2>
        <p className="text-gray-400 text-sm">
          AI-powered planning tool for NGO coordinators. Select a region and available 
          medical resources — get an instant deployment plan.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3">
        {[
          { n: 1, label: 'Select Region' },
          { n: 2, label: 'Choose Resources' },
          { n: 3, label: 'Get AI Plan' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${step >= s.n
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-500'}`}>
              <span>{s.n}</span>
              <span>{s.label}</span>
            </div>
            {i < 2 && <div className={`h-px w-8 ${step > s.n ? 'bg-emerald-600' : 'bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Step 1: Region Selection */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Step 1: Select Region</h3>
            <p className="text-gray-500 text-xs mt-0.5">Choose deployment target</p>
          </div>
          <div className="p-4 space-y-2">
            {regions.map(r => {
              const urgency = getUrgency(r)
              return (
                <button key={r} onClick={() => { setSelectedRegion(r); setStep(Math.max(step, 2)) }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all
                    ${selectedRegion === r
                      ? 'bg-emerald-900/30 border-emerald-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${urgency.color === 'red' ? 'bg-red-900/40 text-red-400' :
                        urgency.color === 'yellow' ? 'bg-yellow-900/40 text-yellow-400' :
                        'bg-blue-900/40 text-blue-400'}`}>
                      {urgency.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Doctor Selection */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Step 2: Available Resources</h3>
            <p className="text-gray-500 text-xs mt-0.5">Select doctors to deploy</p>
          </div>
          <div className="p-4 space-y-3">
            {doctorTypes.map(d => {
              const isNeeded = selectedRegion && d.needed.includes(selectedRegion)
              const isSelected = selectedDoctors.includes(d.id)
              return (
                <button key={d.id}
                  onClick={() => { toggleDoctor(d.id); setStep(Math.max(step, 2)) }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all
                    ${isSelected
                      ? 'bg-emerald-900/30 border-emerald-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{d.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {d.label}
                      </p>
                      {isNeeded && (
                        <p className="text-yellow-400 text-xs">⚠️ Urgently needed here</p>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center
                      ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-600'}`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                </button>
              )
            })}

            <button
              onClick={generatePlan}
              disabled={!selectedRegion || selectedDoctors.length === 0 || loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-colors">
              {loading ? '🤖 AI Planning...' : '📋 Generate Deployment Plan →'}
            </button>
          </div>
        </div>

        {/* Step 3: AI Plan */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Step 3: AI Deployment Plan</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {selectedRegion ? `For ${selectedRegion}` : 'Complete steps 1 & 2'}
              </p>
            </div>
            {plan && <span className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-800 px-2 py-1 rounded-full">AI Generated</span>}
          </div>

          <div className="p-5 h-[500px] overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <div className="text-center space-y-1">
                  <p className="text-white text-sm font-medium">AI is analyzing...</p>
                  <p className="text-gray-500 text-xs">Searching 987 hospital records</p>
                  <p className="text-gray-500 text-xs">Calculating optimal deployment</p>
                </div>
              </div>
            )}

            {!loading && !plan && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <span className="text-5xl">📋</span>
                <p className="text-gray-400 font-medium">No plan yet</p>
                <p className="text-gray-600 text-sm">
                  Select a region and resources, then click Generate
                </p>
              </div>
            )}

            {plan && !loading && (
              <div className="space-y-5">
                {/* Summary bar */}
                <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-3">
                  <p className="text-emerald-400 text-xs font-semibold">✅ Plan Generated</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Deploying {selectedDoctors.length} resource type(s) to {selectedRegion}
                  </p>
                </div>

                {/* Plan text */}
                <div className="space-y-2">
                  {plan.answer.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className={`text-sm leading-relaxed
                      ${line.match(/^\d\./) ? 'text-white font-medium mt-3' :
                        line.startsWith('**') ? 'text-emerald-400 font-semibold' :
                        'text-gray-400'}`}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>

                {/* Citations */}
                {plan.citations?.length > 0 && (
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                      📎 Based on real hospital data
                    </p>
                    {plan.citations.map((c, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3 mb-2">
                        <p className="text-emerald-400 text-xs font-semibold">{c.hospital}</p>
                        <p className="text-gray-500 text-xs">{c.city}, {c.region}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="border-t border-gray-800 pt-4 space-y-2">
                  <button
                    onClick={() => {
                      const text = `DEPLOYMENT PLAN - ${selectedRegion}\n\n${plan.answer}`
                      navigator.clipboard.writeText(text)
                      alert('Plan copied to clipboard!')
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs transition-colors">
                    📋 Copy Plan to Clipboard
                  </button>
                  <button
                    onClick={() => { setPlan(null); setSelectedRegion(''); setSelectedDoctors([]); setStep(1) }}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs transition-colors">
                    🔄 Start New Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}