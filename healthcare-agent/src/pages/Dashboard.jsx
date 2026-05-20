import { mockStats } from '../mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const statCards = [
  { label: "Total Facilities", value: mockStats.totalFacilities, icon: "🏥", color: "emerald", sub: "Across all regions" },
  { label: "Medical Deserts", value: mockStats.medicalDeserts, icon: "⚠️", color: "red", sub: "Districts with critical gaps" },
  { label: "Regions With Gaps", value: mockStats.regionsWithGaps, icon: "🗺️", color: "yellow", sub: "Need urgent attention" },
  { label: "Data Completeness", value: `${mockStats.dataCompletenessAvg}%`, icon: "📊", color: "blue", sub: "Average across facilities" },
]

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6']

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full
                ${card.color === 'emerald' ? 'bg-emerald-900/50 text-emerald-400' : ''}
                ${card.color === 'red' ? 'bg-red-900/50 text-red-400' : ''}
                ${card.color === 'yellow' ? 'bg-yellow-900/50 text-yellow-400' : ''}
                ${card.color === 'blue' ? 'bg-blue-900/50 text-blue-400' : ''}
              `}>Live</span>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            <p className="text-gray-600 text-xs mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">

        {/* Bar Chart - Gap by Region */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-1">Healthcare Gap Score by Region</h3>
          <p className="text-gray-500 text-xs mb-6">Higher = more critical need</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockStats.gapsByRegion}>
              <XAxis dataKey="region" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Facility Types */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-1">Facilities by Type</h3>
          <p className="text-gray-500 text-xs mb-4">Distribution across Ghana</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mockStats.facilitiesByType} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}
              >
                {mockStats.facilitiesByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Alert Banner */}
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-5 flex items-start gap-4">
        <span className="text-2xl">🚨</span>
        <div>
          <p className="text-red-400 font-semibold">Critical Alert: 3 Medical Deserts Detected</p>
          <p className="text-gray-400 text-sm mt-1">
            Upper West, Upper East, and Northern regions have zero emergency-capable facilities.
            Immediate resource allocation recommended.
          </p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'deserts' }))}
          className="ml-auto bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap transition-colors">
          View Details →
        </button>
      </div>

    </div>
  )
}