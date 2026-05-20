import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { mockHospitals } from "../mockData";

const regions = [
  { name: "Greater Accra", hospitals: 312, hasEmergency: true, gapScore: 2, lat: 5.603, lon: -0.187 },
  { name: "Ashanti", hospitals: 198, hasEmergency: true, gapScore: 4, lat: 6.688, lon: -1.624 },
  { name: "Central", hospitals: 87, hasEmergency: false, gapScore: 5, lat: 5.104, lon: -1.284 },
  { name: "Northern", hospitals: 43, hasEmergency: false, gapScore: 9, lat: 9.407, lon: -0.853 },
  { name: "Upper West", hospitals: 21, hasEmergency: false, gapScore: 10, lat: 10.329, lon: -2.327 },
  { name: "Upper East", hospitals: 28, hasEmergency: false, gapScore: 8, lat: 10.787, lon: -0.847 },
  { name: "Volta", hospitals: 56, hasEmergency: false, gapScore: 6, lat: 6.571, lon: 0.450 },
  { name: "Brong-Ahafo", hospitals: 72, hasEmergency: false, gapScore: 7, lat: 7.934, lon: -1.598 },
]

const getColor = (score) => {
  if (score <= 3) return '#10b981'   // green - good
  if (score <= 6) return '#f59e0b'   // yellow - warning
  return '#ef4444'                    // red - critical
}

export default function MedicalDeserts() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    setTimeout(() => setMapReady(true), 100)
  }, [])

  const filtered = filter === 'all' ? regions
    : filter === 'critical' ? regions.filter(r => r.gapScore >= 7)
    : regions.filter(r => r.gapScore < 7)

  return (
    <div className="space-y-6">

      {/* Top Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Critical Regions", value: "3", color: "red", desc: "Gap score ≥ 7", icon: "🔴" },
          { label: "Warning Regions", value: "3", color: "yellow", desc: "Gap score 4–6", icon: "🟡" },
          { label: "Adequate Regions", value: "2", color: "emerald", desc: "Gap score ≤ 3", icon: "🟢" },
        ].map(s => (
          <div key={s.label} className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4
            ${s.color === 'red' ? 'border-red-800' : s.color === 'yellow' ? 'border-yellow-800' : 'border-emerald-800'}`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-white text-2xl font-bold">{s.value}</p>
              <p className="text-gray-300 text-sm font-medium">{s.label}</p>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Map */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Ghana Healthcare Coverage Map</h3>
              <p className="text-gray-500 text-xs mt-0.5">Click a region dot for details</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>Good</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"/>Warning</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Critical</span>
            </div>
          </div>
          <div style={{ height: '400px' }}>
            {mapReady && (
              <MapContainer center={[7.9465, -1.0232]} zoom={6.5}
                style={{ height: '100%', width: '100%', background: '#111827' }}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CartoDB'
                />
                {regions.map(r => (
                  <CircleMarker
                    key={r.name}
                    center={[r.lat, r.lon]}
                    radius={Math.max(10, r.hospitals / 20)}
                    pathOptions={{
                      fillColor: getColor(r.gapScore),
                      color: getColor(r.gapScore),
                      fillOpacity: 0.7,
                      weight: 2
                    }}
                    eventHandlers={{ click: () => setSelected(r) }}
                  >
                    <Popup>
                      <div style={{ background: '#1f2937', padding: '8px', borderRadius: '8px', color: 'white', minWidth: '160px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{r.name}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>Hospitals: {r.hospitals}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>Gap Score: {r.gapScore}/10</p>
                        <p style={{ fontSize: '12px', color: r.hasEmergency ? '#10b981' : '#ef4444' }}>
                          Emergency Care: {r.hasEmergency ? '✅ Available' : '❌ Missing'}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Region Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold">Region Analysis</h3>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="all">All Regions</option>
              <option value="critical">Critical Only</option>
              <option value="ok">Adequate Only</option>
            </select>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '400px' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr>
                  <th className="text-left text-gray-400 px-5 py-3 text-xs font-semibold">Region</th>
                  <th className="text-left text-gray-400 px-3 py-3 text-xs font-semibold">Hospitals</th>
                  <th className="text-left text-gray-400 px-3 py-3 text-xs font-semibold">Emergency</th>
                  <th className="text-left text-gray-400 px-3 py-3 text-xs font-semibold">Gap Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.name}
                    onClick={() => setSelected(r)}
                    className={`border-t border-gray-800 cursor-pointer transition-colors
                      ${selected?.name === r.name ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}>
                    <td className="px-5 py-3 text-white font-medium">{r.name}</td>
                    <td className="px-3 py-3 text-gray-400">{r.hospitals}</td>
                    <td className="px-3 py-3">
                      {r.hasEmergency
                        ? <span className="text-emerald-400 text-xs bg-emerald-900/30 px-2 py-0.5 rounded-full">✅ Yes</span>
                        : <span className="text-red-400 text-xs bg-red-900/30 px-2 py-0.5 rounded-full">❌ No</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all"
                            style={{ width: `${r.gapScore * 10}%`, backgroundColor: getColor(r.gapScore) }} />
                        </div>
                        <span className="text-gray-300 text-xs w-6">{r.gapScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected region detail */}
          {selected && (
            <div className="border-t border-gray-800 p-5 bg-gray-800/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-semibold">{selected.name} Region</h4>
                  <p className="text-gray-400 text-xs mt-1">Gap Score: {selected.gapScore}/10 — {selected.gapScore >= 7 ? '🔴 Critical' : selected.gapScore >= 4 ? '🟡 Warning' : '🟢 Adequate'}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400 text-lg">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Total Hospitals</p>
                  <p className="text-white font-bold text-lg">{selected.hospitals}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Emergency Care</p>
                  <p className={`font-bold text-lg ${selected.hasEmergency ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selected.hasEmergency ? 'Available' : 'MISSING'}
                  </p>
                </div>
              </div>
              {!selected.hasEmergency && (
                <div className="mt-3 bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-xs font-semibold">⚠️ Recommended Action</p>
                  <p className="text-gray-400 text-xs mt-1">Deploy mobile emergency unit and assign 2+ emergency physicians to {selected.name} immediately.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}