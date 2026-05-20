import { useState } from 'react'

export default function AgentChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm your Ghana Healthcare Intelligence Agent. Ask me anything about hospital capabilities, medical deserts, or resource gaps across Ghana.",
      citations: [],
      agentSteps: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSteps, setShowSteps] = useState(null)

  const quickQuestions = [
    "Which regions have no emergency care?",
    "Where should we send surgeons?",
    "Find hospitals with suspicious data",
    "What are the biggest medical deserts?",
  ]

  const sendMessage = async (question) => {
    const q = question || input.trim()
    if (!q) return

    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('https://ghana-healthcare-intelligence.onrender.com/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ question: q })
      })
      const data = await res.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        citations: data.citations || [],
        agentSteps: data.agentSteps || []
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '⚠️ Could not reach the agent. Make sure the backend is running on port 8000.',
        citations: [],
        agentSteps: []
      }])
    }

    setLoading(false)
  }

  return (
    <div className="flex gap-6 h-[78vh]">

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  🤖
                </div>
              )}

              <div className="max-w-[75%] space-y-3">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                    : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                  }`}>
                  {msg.text.split('\n').map((line, i) => (
  <p key={i} className={line.startsWith('**') ? 'font-semibold text-white' : ''}>
    {line.replace(/\*\*/g, '')}
  </p>
))}
                </div>

                {msg.agentSteps?.length > 0 && (
                  <button
                    onClick={() => setShowSteps(showSteps === i ? null : i)}
                    className="text-xs text-gray-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    🔍 {showSteps === i ? 'Hide' : 'Show'} agent reasoning ({msg.agentSteps.length} steps)
                  </button>
                )}

                {showSteps === i && msg.agentSteps && (
                  <div className="bg-gray-950 border border-gray-700 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Agent Reasoning Steps</p>
                    {msg.agentSteps.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <span className="w-5 h-5 bg-emerald-900 text-emerald-400 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold">
                          {step.step}
                        </span>
                        <div>
                          <p className="text-gray-300 text-xs font-medium">{step.action}</p>
                          <p className="text-gray-500 text-xs mt-0.5">→ {step.result}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.citations?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">📎 Sources Used</p>
                    {msg.citations.map((c, ci) => (
                      <div key={ci} className="bg-gray-950 border border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-emerald-400 text-xs font-semibold">{c.hospital}</p>
                          <span className="text-gray-600 text-xs">{c.city}, {c.region}</span>
                        </div>
                        <p className="text-gray-400 text-xs">"{c.value}"</p>
                        <p className="text-gray-600 text-xs mt-1 italic">{c.relevance}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  👤
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm">🤖</div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="text-gray-400 text-sm">Agent is thinking</span>
                  <span className="flex gap-1 ml-2">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about hospitals, gaps, resources..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors">
            Send →
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-64 space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Agent Capabilities</h3>
          <div className="space-y-3">
            {[
              { icon: "🔍", label: "Search Hospitals", desc: "By location or specialty" },
              { icon: "⚠️", label: "Detect Deserts", desc: "Find coverage gaps" },
              { icon: "🚨", label: "Flag Anomalies", desc: "Suspicious data alerts" },
              { icon: "📍", label: "Route Doctors", desc: "Placement suggestions" },
            ].map(cap => (
              <div key={cap.label} className="flex gap-3">
                <span className="text-lg">{cap.icon}</span>
                <div>
                  <p className="text-gray-300 text-xs font-medium">{cap.label}</p>
                  <p className="text-gray-600 text-xs">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-5">
          <h3 className="text-emerald-400 font-semibold text-sm mb-2">💡 Tip</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Click "Show agent reasoning" under any response to see exactly which data the AI used — step by step.
          </p>
        </div>
      </div>

    </div>
  )
}
