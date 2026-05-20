from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import mlflow         
import time
from database import init_db, get_db
from auth import register_user, login_user, decode_token
from agent import query_agent

app = FastAPI(title="Ghana Healthcare API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# ─── Models ───────────────────────────────
class RegisterBody(BaseModel):
    name: str
    email: str
    password: str

class LoginBody(BaseModel):
    email: str
    password: str

class QueryBody(BaseModel):
    question: str

# ─── Auth Routes ──────────────────────────
@app.post("/api/register")
def register(body: RegisterBody):
    result = register_user(body.name, body.email, body.password)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Account created successfully"}

@app.post("/api/login")
def login(body: LoginBody):
    result = login_user(body.email, body.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@app.get("/api/me")
def get_me(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# ─── Agent Route ──────────────────────────
@app.post("/api/query")
def query(body: QueryBody, authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization:
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        if payload:
            user_id = payload.get("user_id")

    result = query_agent(body.question)

    if user_id:
        conn = get_db()
        conn.execute(
            "INSERT INTO query_history (user_id, question, answer) VALUES (?, ?, ?)",
            (user_id, body.question, result["answer"])
        )
        conn.commit()
        conn.close()

    return result

# ─── Data Routes ──────────────────────────
@app.get("/api/stats")
def get_stats():
    conn = get_db()
    cursor = conn.cursor()

    # Total facilities
    cursor.execute("SELECT COUNT(*) FROM hospitals")
    total = cursor.fetchone()[0]

    # By type
    cursor.execute("""
        SELECT facilityTypeId, COUNT(*) as count 
        FROM hospitals 
        WHERE facilityTypeId IS NOT NULL
        GROUP BY facilityTypeId
        ORDER BY count DESC
    """)
    by_type = [{"name": r[0].capitalize(), "value": r[1]} for r in cursor.fetchall()]

    # Medical deserts (regions with no emergency)
    cursor.execute("""
        SELECT address_stateOrRegion, COUNT(*) as total,
               SUM(CASE WHEN capability LIKE '%emergency%' THEN 1 ELSE 0 END) as emergency
        FROM hospitals
        WHERE address_stateOrRegion IS NOT NULL
        GROUP BY address_stateOrRegion
        HAVING emergency = 0
    """)
    deserts = cursor.fetchall()

    # Gap by region
    cursor.execute("""
        SELECT address_stateOrRegion as region,
               COUNT(*) as total,
               SUM(CASE WHEN capability LIKE '%emergency%' THEN 1 ELSE 0 END) as emergency,
               SUM(CASE WHEN capability LIKE '%ICU%' THEN 1 ELSE 0 END) as icu,
               SUM(CASE WHEN capability LIKE '%surg%' THEN 1 ELSE 0 END) as surgery
        FROM hospitals
        WHERE address_stateOrRegion IS NOT NULL
          AND address_stateOrRegion != ''
        GROUP BY address_stateOrRegion
        ORDER BY total DESC
        LIMIT 8
    """)
    regions = cursor.fetchall()

    gap_scores = []
    for r in regions:
        total_r = r[1] or 1
        score = round(10 - ((r[2] + r[3] + r[4]) / (total_r * 3)) * 10)
        score = max(1, min(10, score))
        gap_scores.append({"region": r[0], "score": score})

    # Data completeness
    cursor.execute("""
        SELECT AVG(
            (CASE WHEN name IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN address_city IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN facilityTypeId IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN specialties IS NOT NULL AND specialties != '[]' THEN 1 ELSE 0 END +
             CASE WHEN capability IS NOT NULL AND capability != 'null' THEN 1 ELSE 0 END +
             CASE WHEN phone_numbers IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / 6
        ) FROM hospitals
    """)
    completeness = round(cursor.fetchone()[0] or 0)

    conn.close()

    return {
        "totalFacilities": total,
        "medicalDeserts": len(deserts),
        "regionsWithGaps": len([g for g in gap_scores if g["score"] >= 7]),
        "dataCompletenessAvg": completeness,
        "facilitiesByType": by_type,
        "gapsByRegion": gap_scores
    }

@app.get("/api/hospitals")
def get_hospitals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, address_city, address_stateOrRegion,
               facilityTypeId, specialties, capability,
               phone_numbers, email, numberDoctors, capacity,
               rowid as id
        FROM hospitals
        WHERE name IS NOT NULL
        LIMIT 100
    """)
    rows = cursor.fetchall()
    conn.close()

    # Ghana city coordinates (approximate)
    city_coords = {
        "Accra": (5.603, -0.187),
        "Kumasi": (6.688, -1.624),
        "Tamale": (9.407, -0.853),
        "Takoradi": (4.896, -1.756),
        "Bolgatanga": (10.787, -0.847),
        "Wa": (10.060, -2.500),
        "Sunyani": (7.340, -2.329),
        "Cape Coast": (5.105, -1.246),
        "Ho": (6.601, 0.469),
        "Koforidua": (6.094, -0.261),
    }

    results = []
    for r in rows:
        city = r['address_city'] or 'Accra'
        coords = city_coords.get(city, (5.603 + (hash(city) % 100) * 0.01, -0.187 + (hash(city) % 50) * 0.01))
        cap = str(r['capability'] or '').lower()
        spec = str(r['specialties'] or '[]')

        results.append({
            "id": r['id'],
            "name": r['name'],
            "city": city,
            "region": r['address_stateOrRegion'] or 'Unknown',
            "type": r['facilityTypeId'] or 'clinic',
            "lat": coords[0],
            "lon": coords[1],
            "specialties": [s.strip().strip('"[]"\'') for s in spec.strip('[]').split(',') if s.strip()],
            "hasEmergency": 'emergency' in cap,
            "hasICU": 'icu' in cap or 'intensive' in cap,
            "hasSurgery": 'surg' in cap,
            "completeness": 70 if r['phone_numbers'] else 40
        })

    return results

@app.get("/api/anomalies")
def get_anomalies():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, address_city, address_stateOrRegion,
               facilityTypeId, specialties, capability,
               procedure, equipment, numberDoctors, capacity,
               description, phone_numbers, email
        FROM hospitals
        LIMIT 200
    """)
    rows = cursor.fetchall()
    conn.close()

    anomalies = []
    for r in rows:
        issues = []
        severity = 'low'

        name = r['name'] or 'Unknown'
        city = r['address_city'] or 'Unknown'
        region = r['address_stateOrRegion'] or 'Unknown'

        # Calculate completeness
        fields = [r['name'], r['address_city'], r['address_stateOrRegion'],
                  r['facilityTypeId'], r['specialties'], r['capability'],
                  r['phone_numbers'], r['email'], r['description']]
        filled = sum(1 for f in fields if f and str(f) not in ['None', 'null', '[]', ''])
        completeness = int((filled / len(fields)) * 100)

        # Check for anomalies
        cap = str(r['capability'] or '').lower()
        proc = str(r['procedure'] or '').lower()
        equip = str(r['equipment'] or '').lower()

        if 'surg' in proc and not any(w in equip for w in ['theatre', 'surgical', 'operating']):
            issues.append("Claims surgical procedures but no surgical equipment listed")
            severity = 'high'

        if any(w in cap for w in ['icu', 'intensive care']) and (not r['capacity'] or r['capacity'] == 0):
            issues.append("Claims ICU capability but bed capacity is 0 or unknown")
            severity = 'high'

        if not r['phone_numbers'] and not r['email']:
            issues.append("No contact information available — cannot verify facility")
            if severity == 'low':
                severity = 'medium'

        if completeness < 30:
            issues.append(f"Only {completeness}% of fields are filled — record needs verification")
            if severity == 'low':
                severity = 'medium'

        if r['facilityTypeId'] == 'hospital' and not r['numberDoctors']:
            issues.append("Listed as hospital but number of doctors not recorded")
            if severity == 'low':
                severity = 'low'

        if issues:
            anomalies.append({
                "hospital": name,
                "city": city,
                "region": region,
                "issues": issues,
                "severity": severity,
                "completeness": completeness
            })

    # Sort by severity
    order = {'high': 0, 'medium': 1, 'low': 2}
    anomalies.sort(key=lambda x: order.get(x['severity'], 3))

    return anomalies[:50]



class ParseBody(BaseModel):
    text: str
    mode: str = "full"  # full, facts, specialties, org

@app.post("/api/parse")
def parse_text(body: ParseBody):
    from agent import client
    import json

    FREE_FORM_PROMPT = """
ROLE: You are a specialized medical facility information extractor.

CATEGORY DEFINITIONS:
- procedure: Clinical procedures, surgical operations, medical interventions performed at the facility
- equipment: Physical medical devices, diagnostic machines, infrastructure, utilities
- capability: Medical capabilities defining level and types of clinical care delivered

EXTRACTION GUIDELINES:
- Use clear declarative statements in plain English
- Include specific quantities when available
- Only extract facts directly supported by the provided content
- All arrays can be empty if no relevant facts are found

Return ONLY valid JSON with these exact keys:
{
  "procedure": ["list of procedures"],
  "equipment": ["list of equipment"],
  "capability": ["list of capabilities"],
  "specialties": ["list of specialties in camelCase"],
  "facilityType": "hospital/clinic/health centre/pharmacy/dentist",
  "operatorType": "public/private or null"
}

SPECIALTY RULES (use exact camelCase):
- internalMedicine, familyMedicine, pediatrics, cardiology
- generalSurgery, emergencyMedicine, gynecologyAndObstetrics
- orthopedicSurgery, dentistry, ophthalmology, psychiatry
- pathology, radiology, nephrology, oncology

No markdown, no explanation. Only JSON.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": FREE_FORM_PROMPT},
                {"role": "user", "content": f"Extract structured medical data from this text:\n\n{body.text}"}
            ],
            max_tokens=800,
            temperature=0.1
        )

        text = response.choices[0].message.content
        text = text.replace('```json', '').replace('```', '').strip()
        result = json.loads(text)

        # Log to MLFlow
        with mlflow.start_run(run_name=f"idp_parse_{int(time.time())}"):
            mlflow.log_param("input_text", body.text[:200])
            mlflow.log_param("mode", "idp_extraction")
            mlflow.log_metric("procedures_found", len(result.get("procedure", [])))
            mlflow.log_metric("equipment_found", len(result.get("equipment", [])))
            mlflow.log_metric("capabilities_found", len(result.get("capability", [])))
            mlflow.log_metric("specialties_found", len(result.get("specialties", [])))

        return result

    except Exception as e:
        return {"error": f"Parse failed: {str(e)}"}

@app.get("/")
def root():
    return {"message": "Ghana Healthcare API is running ✅"}