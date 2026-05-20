import { mockStats, mockHospitals, mockAgentResponse } from './mockData'

const USE_MOCK = true  // ← Change to false when friend is ready
const BASE_URL = "http://localhost:8000"

export async function queryAgent(question) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 2000))
    return { ...mockAgentResponse, query: question }
  }
  const res = await fetch(`${BASE_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  })
  return res.json()
}

export async function getHospitals() {
  if (USE_MOCK) return mockHospitals
  const res = await fetch(`${BASE_URL}/api/hospitals`)
  return res.json()
}

export async function getStats() {
  if (USE_MOCK) return mockStats
  const res = await fetch(`${BASE_URL}/api/stats`)
  return res.json()
}