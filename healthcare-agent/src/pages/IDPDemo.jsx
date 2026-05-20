import { useState } from 'react'

const examples = [
  {
    id: 1,
    source: "Facebook Page",
    raw: "Modern Healthcare for everybody. We do all types of laboratory test 24/7. Ultra modern theatre for Major and Minor surgeries. 24 / 7 Dispensary for all types of medications. Dialysis Center on site. ANIH app enables appointment scheduling.",
    parsed: {
      facilityType: "Hospital",
      operatorType: "Private",
      specialties: ["generalSurgery", "nephrology", "clinicalPathology"],
      procedures: [
        "Performs laboratory testing (24/7)",
        "Offers major and minor surgeries",
        "Provides hemodialysis (dialysis center on site)"
      ],
      equipment: [
        "Ultra-modern operating theatre",
        "On-site laboratory facilities",
        "Dialysis machines"
      ],
      capabilities: [
        "24/7 laboratory services",
        "24/7 pharmacy/dispensary",
        "Online appointment scheduling via ANIH app",
        "Inpatient dialysis care"
      ]
    }
  },
  {
    id: 2,
    source: "GhanaHospitals.org",
    raw: "OPD services; 24hr Emergency care; in-patients services; Clinical Psychology services; Electro Convulsive Therapy; Laboratory Services; 24 hr Pharmacy; Social Work Services; Community Psychiatry Nursing Services; drug treatment & Rehab; occupational therapy services. Bed state: 15 wards with the capacity to accommodate 600 patients; currently running 300 beds due to Covid-19.",
    parsed: {
      facilityType: "Hospital",
      operatorType: "Public",
      specialties: ["psychiatry", "addictionPsychiatry", "clinicalPsychology"],
      procedures: [
        "Provides OPD services",
        "Performs Electro Convulsive Therapy (ECT)",
        "Offers drug treatment and rehabilitation",
        "Provides laboratory testing"
      ],
      equipment: [
        "ECT machine",
        "On-site laboratory",
        "24hr pharmacy"
      ],
      capabilities: [
        "24-hour emergency care",
        "Inpatient capacity: 600 beds (15 wards)",
        "Currently operating 300 beds",
        "Community psychiatry nursing",
        "Occupational therapy services"
      ]
    }
  },
  {
    id: 3,
    source: "Official Website",
    raw: "Excellence in Eye Care. Performs micro-incision cataract surgery (phaco), vitrectomy for retinal detachment, cornea transplant surgeries. Voted Best Eye Hospital in Ghana. Has OCT machine, fundus photography equipment, B-scan ocular ultrasonography. Insurance partnerships with Metro, Glico, Star, ACE Medical, and NHIS.",
    parsed: {
      facilityType: "Hospital",
      operatorType: "Private",
      specialties: ["ophthalmology", "cataractAndAnteriorSegmentSurgery", "retinaAndVitreoretinalOphthalmology"],
      procedures: [
        "Performs micro-incision cataract surgery (phacoemulsification)",
        "Performs vitrectomy for retinal detachment",
        "Performs cornea transplant surgeries"
      ],
      equipment: [
        "Optical Coherence Tomography (OCT) machine",
        "Fundus photography equipment",
        "B-scan ocular ultrasonography device"
      ],
      capabilities: [
        "Voted Best Eye Hospital in Ghana",
        "Advanced laser surgery capability",
        "NHIS and private insurance accepted"
      ]
    }
  }
]

const FieldBadge = ({ text }) => (
  <span className="inline-block bg-emerald-900/40 border border-emerald-800 text-emerald-400 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">
    {text}
  </span>
)

export default function IDPDemo() {
  const [selected, setSelected] = useState(examples[0])
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [customText, setCustomText] = useState('')
  const [customResult, setCustomResult] = useState(null)
  const [customLoading, setCustomLoading] = useState(false)

  const runDemo = async () => {
    setStep(0)
    setRunning(true)
    await new Promise(r => setTimeout(r, 800))
    setStep(1)
    await new Promise(r => setTimeout(r, 900))
    setStep(2)
    await new Promise(r => setTimeout(r, 900))
    setStep(3)
    await new Promise(r => setTimeout(r, 700))
    setStep(4)
    setRunning(false)
  }

  const runCustom = async () => {
    if (!customText.trim()) return
    setCustomLoading(true)
    setCustomResult(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ text: customText })
      })
      const data = await res.json()
      setCustomResult(data)
    } catch (err) {
      setCustomResult({ error: 'Could not reach backend' })
    }
    setCustomLoading(false)
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-gray-900 border border-emerald-800/50 rounded-xl p-6">
        <h2 className="text-white font-bold text-xl mb-1">
          🧠 Intelligent Document Parsing (IDP) 
        </h2>
        <p className="text-gray-400 text-sm">
          Watch how our AI transforms raw, unstructured hospital text into clean structured medical data — extracting specialties, equipment, procedures and capabilities automatically.
        </p>
      </div>

    {/* Try Your Own */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-1">🔬 Try Your Own Text</h3>
        <p className="text-gray-500 text-sm mb-4">
          Paste any hospital description and our AI will extract structured data from it
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Paste hospital description here... e.g. 'We provide 24hr maternity care, laboratory services, and minor surgeries. Our facility has 45 beds and 3 doctors on duty.'"
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button onClick={runCustom} disabled={customLoading || !customText.trim()}
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {customLoading ? '⚡ Parsing with AI...' : '🧠 Parse with AI'}
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 min-h-[180px]">
            {customLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex gap-1 justify-center mb-2">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">AI is parsing your text...</p>
                </div>
              </div>
            )}
            {customResult && !customResult.error && (
              <div className="space-y-3 text-xs">
                <p className="text-emerald-400 font-semibold">✅ Parsed Successfully</p>
                {Object.entries(customResult).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-gray-500 uppercase text-xs tracking-wider mb-1">{key}</p>
                    {Array.isArray(val) ? (
                      <div className="flex flex-wrap gap-1">
                        {val.map((v, i) => <FieldBadge key={i} text={v} />)}
                      </div>
                    ) : (
                      <p className="text-gray-300">{val}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!customLoading && !customResult && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 text-sm text-center">
                  Parsed results will appear here
                </p>
              </div>
            )}
            {customResult?.error && (
              <p className="text-red-400 text-sm">{customResult.error}</p>
            )}
          </div>
        </div>
      </div>


      {/* Example Selector */}
      <div className="flex gap-3">
        {examples.map(ex => (
          <button key={ex.id} onClick={() => { setSelected(ex); setStep(0) }}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors
              ${selected.id === ex.id
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
            Example {ex.id} — {ex.source}
          </button>
        ))}
      </div>

      {/* Main Demo */}
      <div className="grid grid-cols-2 gap-6">

        {/* Left: Raw Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">📄 Raw Input</h3>
              <p className="text-gray-500 text-xs mt-0.5">Unstructured text from {selected.source}</p>
            </div>
            <span className="bg-red-900/30 text-red-400 border border-red-800 text-xs px-2 py-1 rounded-full">
              Unstructured
            </span>
          </div>
          <div className="p-5">
            <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed font-mono">
                {selected.raw}
              </p>
            </div>

            {/* Processing Steps */}
            <div className="mt-5 space-y-2">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                AI Processing Pipeline
              </p>
              {[
                { label: "Tokenize & clean text", icon: "🔤" },
                { label: "Extract medical entities", icon: "🏥" },
                { label: "Classify by schema fields", icon: "🗂️" },
                { label: "Validate & structure output", icon: "✅" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500
                  ${step > i ? 'bg-emerald-900/20 border border-emerald-900' : 'bg-gray-800 border border-gray-700'}`}>
                  <span className="text-base">{s.icon}</span>
                  <span className={`text-xs font-medium transition-colors
                    ${step > i ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                  {step > i && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
                  {step === i + 1 && running && (
                    <span className="ml-auto flex gap-0.5">
                      {[0,1,2].map(j => (
                        <span key={j} className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${j * 0.15}s` }} />
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button onClick={runDemo} disabled={running}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {running ? '⚡ Parsing...' : '▶ Run IDP Parser'}
            </button>
          </div>
        </div>

        {/* Right: Parsed Output */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">✨ Structured Output</h3>
              <p className="text-gray-500 text-xs mt-0.5">Clean schema-compliant data</p>
            </div>
            <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800 text-xs px-2 py-1 rounded-full">
              Structured
            </span>
          </div>

          <div className={`p-5 space-y-5 transition-opacity duration-500 ${step < 4 ? 'opacity-30' : 'opacity-100'}`}>

            {/* Facility Type */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Facility Type</p>
              <span className="bg-blue-900/40 border border-blue-800 text-blue-400 text-sm px-3 py-1 rounded-lg">
                🏥 {selected.parsed.facilityType}
              </span>
            </div>

            {/* Operator Type */}
            {selected.parsed.operatorType && (
            <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                Operator Type
                </p>
                <span className={`text-sm px-3 py-1 rounded-lg border
                ${selected.parsed.operatorType === 'Private'
                    ? 'bg-purple-900/40 border-purple-800 text-purple-400'
                    : 'bg-blue-900/40 border-blue-800 text-blue-400'}`}>
                {selected.parsed.operatorType === 'Private' ? '🏢' : '🏛️'} {selected.parsed.operatorType}
                </span>
            </div>
            )}

            {/* Specialties */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Specialties Extracted</p>
              <div className="flex flex-wrap">
                {selected.parsed.specialties.map(s => <FieldBadge key={s} text={s} />)}
              </div>
            </div>

            {/* Procedures */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Procedures</p>
              <div className="space-y-1.5">
                {selected.parsed.procedures.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 text-xs mt-0.5">→</span>
                    <p className="text-gray-300 text-xs">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Equipment</p>
              <div className="space-y-1.5">
                {selected.parsed.equipment.map((e, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs mt-0.5">⚙️</span>
                    <p className="text-gray-300 text-xs">{e}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Capabilities</p>
              <div className="space-y-1.5">
                {selected.parsed.capabilities.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 text-xs mt-0.5">✦</span>
                    <p className="text-gray-300 text-xs">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {step < 4 && (
            <div className="px-5 pb-5">
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-600 text-sm">
                  {step === 0 ? 'Click "Run IDP Parser" to see the magic →' : '⚡ Processing...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      

    </div>
  )
}