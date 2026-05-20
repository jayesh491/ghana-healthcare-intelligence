import { useState } from 'react'
import { mockHospitals } from '../mockData'

const specialtyColors = {
  internalMedicine: 'blue',
  emergencyMedicine: 'red',
  ophthalmology: 'purple',
  psychiatry: 'pink',
  gynecologyAndObstetrics: 'rose',
  pediatrics: 'yellow',
  generalSurgery: 'orange',
}

const Badge = ({ text, color = 'gray' }) => {
  const colors = {
    blue: 'bg-blue-900/40 text-blue-400 border-blue-800',
    red: 'bg-red-900/40 text-red-400 border-red-800',
    purple: 'bg-purple-900/40 text-purple-400 border-purple-800',
    pink: 'bg-pink-900/40 text-pink-400 border-pink-800',
    rose: 'bg-rose-900/40 text-rose-400 border-rose-800',
    yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    orange: 'bg-orange-900/40 text-orange-400 border-orange-800',
    gray: 'bg-gray-800 text-gray-400 border-gray-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {text.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  )
}

export default function HospitalExplorer() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCap, setFilterCap] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = mockHospitals.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase())
      || h.city.toLowerCase().includes(search.toLowerCase())
      || h.region.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || h.type === filterType
    const matchCap =
      filterCap === 'all' ? true
      : filterCap === 'emergency' ? h.hasEmergency
      : filterCap === 'surgery' ? h.hasSurgery
      : filterCap === 'icu' ? h.hasICU
      : filterCap === 'incomplete' ? h.completeness < 50
      : true
    return matchSearch && matchType && matchCap
  })

  return (
    <div className="flex gap-6 h-[78vh]">

      {/* Left: List */}
      <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

        {/* Filters */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by hospital name, city, or region..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2 flex-wrap">
            {[
              { val: 'all', label: 'All Types' },
              { val: 'hospital', label: '🏥 Hospital' },
              { val: 'clinic', label: '🏨 Clinic' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilterType(f.val)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${filterType === f.val ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {f.label}
              </button>
            ))}
            <div className="w-px bg-gray-700 mx-1" />
            {[
              { val: 'all', label: 'All' },
              { val: 'emergency', label: '🚨 Emergency' },
              { val: 'surgery', label: '🔪 Surgery' },
              { val: 'icu', label: '🫁 ICU' },
              { val: 'incomplete', label: '⚠️ Incomplete Data' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilterCap(f.val)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${filterCap === f.val ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-gray-600 text-xs">{filtered.length} facilities found</p>
        </div>

        {/* Hospital List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600">
              No facilities match your search
            </div>
          ) : (
            filtered.map(h => (
              <div key={h.id} onClick={() => setSelected(h)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-800/50
                  ${selected?.id === h.id ? 'bg-gray-800 border-l-2 border-emerald-500' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm truncate">{h.name}</p>
                      <span className="text-xs text-gray-500 capitalize shrink-0">{h.type}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">📍 {h.city}, {h.region}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {h.specialties.slice(0, 2).map(s => (
                        <Badge key={s} text={s} color={specialtyColors[s] || 'gray'} />
                      ))}
                      {h.specialties.length > 2 && (
                        <span className="text-xs text-gray-600">+{h.specialties.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Completeness */}
                    <div className="text-right">
                      <p className={`text-xs font-semibold
                        ${h.completeness >= 70 ? 'text-emerald-400' : h.completeness >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {h.completeness}%
                      </p>
                      <p className="text-gray-600 text-xs">complete</p>
                    </div>
                    {/* Capability dots */}
                    <div className="flex gap-1">
                      <span title="Emergency" className={`w-2 h-2 rounded-full ${h.hasEmergency ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                      <span title="ICU" className={`w-2 h-2 rounded-full ${h.hasICU ? 'bg-blue-400' : 'bg-gray-700'}`} />
                      <span title="Surgery" className={`w-2 h-2 rounded-full ${h.hasSurgery ? 'bg-purple-400' : 'bg-gray-700'}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <div className="w-72 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold leading-tight">{selected.name}</h3>
                  <p className="text-gray-500 text-xs mt-1">📍 {selected.city}, {selected.region}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400">✕</button>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Data Completeness</span>
                  <span className={selected.completeness >= 70 ? 'text-emerald-400' : selected.completeness >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                    {selected.completeness}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all"
                    style={{
                      width: `${selected.completeness}%`,
                      backgroundColor: selected.completeness >= 70 ? '#10b981' : selected.completeness >= 50 ? '#f59e0b' : '#ef4444'
                    }} />
                </div>
                {selected.completeness < 50 && (
                  <p className="text-red-400 text-xs mt-1">⚠️ Incomplete record — needs verification</p>
                )}
              </div>
            </div>

            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              {/* Capabilities */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Capabilities</p>
                <div className="space-y-2">
                  {[
                    { label: 'Emergency Care', has: selected.hasEmergency, icon: '🚨' },
                    { label: 'ICU', has: selected.hasICU, icon: '🫁' },
                    { label: 'Surgery', has: selected.hasSurgery, icon: '🔪' },
                  ].map(c => (
                    <div key={c.label} className={`flex items-center justify-between p-2.5 rounded-lg
                      ${c.has ? 'bg-emerald-900/20 border border-emerald-900' : 'bg-gray-800 border border-gray-700'}`}>
                      <span className="text-gray-300 text-sm">{c.icon} {c.label}</span>
                      <span className={`text-xs font-medium ${c.has ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.has ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {selected.specialties.map(s => (
                    <Badge key={s} text={s} color={specialtyColors[s] || 'gray'} />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Location</p>
                <div className="bg-gray-800 rounded-lg p-3 space-y-1">
                  <p className="text-gray-300 text-sm">📍 {selected.city}</p>
                  <p className="text-gray-500 text-xs">{selected.region} Region, Ghana</p>
                  <p className="text-gray-600 text-xs">Lat: {selected.lat} | Lon: {selected.lon}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">
                Ask Agent About This Hospital →
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <span className="text-5xl mb-4">🏥</span>
            <p className="text-gray-400 font-medium">Select a hospital</p>
            <p className="text-gray-600 text-sm mt-1">Click any facility from the list to see detailed information</p>
          </div>
        )}
      </div>

    </div>
  )
}