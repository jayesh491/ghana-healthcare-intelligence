export const mockStats = {
  totalFacilities: 847,
  regionsWithGaps: 3,
  medicalDeserts: 23,
  dataCompletenessAvg: 58,
  facilitiesByType: [
    { name: "Hospital", value: 312 },
    { name: "Clinic", value: 401 },
    { name: "Health Centre", value: 134 },
  ],
  gapsByRegion: [
    { region: "Greater Accra", score: 2 },
    { region: "Ashanti", score: 4 },
    { region: "Central", score: 5 },
    { region: "Northern", score: 9 },
    { region: "Upper West", score: 10 },
    { region: "Upper East", score: 8 },
  ]
}

export const mockHospitals = [
  { id: 1, name: "37 Military Hospital", city: "Accra", region: "Greater Accra", type: "hospital", lat: 5.603, lon: -0.187, specialties: ["internalMedicine", "emergencyMedicine"], hasEmergency: true, hasICU: true, hasSurgery: true, completeness: 72 },
  { id: 2, name: "Accra Psychiatric Hospital", city: "Accra", region: "Greater Accra", type: "hospital", lat: 5.560, lon: -0.201, specialties: ["psychiatry"], hasEmergency: true, hasICU: false, hasSurgery: false, completeness: 65 },
  { id: 3, name: "Abuakwa Maternity Home", city: "Abuakwa", region: "Ashanti", type: "hospital", lat: 6.688, lon: -1.624, specialties: ["gynecologyAndObstetrics"], hasEmergency: false, hasICU: false, hasSurgery: false, completeness: 40 },
  { id: 4, name: "Accra Specialist Eye Hospital", city: "Accra", region: "Greater Accra", type: "hospital", lat: 5.614, lon: -0.205, specialties: ["ophthalmology"], hasEmergency: false, hasICU: false, hasSurgery: true, completeness: 88 },
  { id: 5, name: "Abura Health Centre", city: "Abura", region: "Central", type: "clinic", lat: 5.104, lon: -1.284, specialties: ["internalMedicine"], hasEmergency: false, hasICU: false, hasSurgery: false, completeness: 30 },
  { id: 6, name: "Adidome Government Hospital", city: "Adidome", region: "Volta", type: "hospital", lat: 6.095, lon: 0.631, specialties: ["internalMedicine"], hasEmergency: false, hasICU: false, hasSurgery: false, completeness: 45 },
]

export const mockAgentResponse = {
  query: "",
  answer: "Based on analysis of 847 facilities across Ghana, 3 regions show critical gaps in emergency care: Upper West, Upper East, and Northern Region. A total of 23 districts have zero emergency-capable facilities within 50km.",
  citations: [
    { hospital: "Abura Health Centre", city: "Abura", region: "Central", field: "capability", value: "Government-owned Health Centre offering general services", relevance: "Confirmed absence of emergency capability" },
    { hospital: "37 Military Hospital", city: "Accra", region: "Greater Accra", field: "capability", value: "Located at Liberation Rd. 37, Accra", relevance: "Confirmed emergency capability in Greater Accra" }
  ],
  agentSteps: [
    { step: 1, action: "Searched vector DB for 'emergency care'", result: "Found 47 matching hospitals" },
    { step: 2, action: "Grouped results by region", result: "Identified 3 regions with 0 matches" },
    { step: 3, action: "Cross-referenced with hospital count per region", result: "Confirmed as medical deserts" }
  ]
}