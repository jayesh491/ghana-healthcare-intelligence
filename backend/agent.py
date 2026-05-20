from groq import Groq
import sqlite3
import mlflow
import mlflow.tracking
import time
from rag import semantic_search

client = Groq(api_key="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")
DB_NAME = "healthcare.db"

# Setup MLFlow
mlflow.set_experiment("ghana-healthcare-agent")

def get_region_stats(region: str) -> str:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN capability LIKE '%emergency%' THEN 1 ELSE 0 END) as emergency,
            SUM(CASE WHEN capability LIKE '%ICU%' THEN 1 ELSE 0 END) as icu,
            SUM(CASE WHEN capability LIKE '%surg%' THEN 1 ELSE 0 END) as surgery
        FROM hospitals
        WHERE address_stateOrRegion LIKE ?
           OR address_city LIKE ?
    """, (f"%{region}%", f"%{region}%"))
    row = cursor.fetchone()
    conn.close()
    if not row or row[0] == 0:
        return f"No data found for: {region}"
    return (
        f"Region: {region} | Total: {row[0]} | "
        f"Emergency: {row[1]} | ICU: {row[2]} | Surgery: {row[3]}"
    )

def get_medical_deserts() -> str:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            address_stateOrRegion as region,
            COUNT(*) as total,
            SUM(CASE WHEN capability LIKE '%emergency%' THEN 1 ELSE 0 END) as emergency,
            SUM(CASE WHEN capability LIKE '%ICU%' THEN 1 ELSE 0 END) as icu
        FROM hospitals
        WHERE address_stateOrRegion IS NOT NULL
        GROUP BY address_stateOrRegion
        ORDER BY emergency ASC, total ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    deserts = []
    for r in rows:
        if r[2] == 0:
            deserts.append(f"- {r[0]}: {r[1]} facilities, 0 emergency, {r[3]} ICU")
    return "\n".join(deserts[:10]) if deserts else "No critical deserts found"

def query_agent(question: str):
    # Start MLFlow run for every query
    with mlflow.start_run(run_name=f"query_{int(time.time())}"):

        # ── Log input ─────────────────────────────────
        mlflow.log_param("question", question[:250])
        mlflow.log_param("model", "llama-3.1-8b-instant")
        mlflow.log_param("dataset_size", 987)

        # ── Step 1: RAG Search ────────────────────────
        step1_start = time.time()
        rag_results = semantic_search(question, k=8)
        step1_time = time.time() - step1_start

        mlflow.log_metric("rag_results_count", len(rag_results))
        mlflow.log_metric("rag_latency_sec", round(step1_time, 3))
        mlflow.log_metric("top_rag_score", round(rag_results[0]['score'], 3) if rag_results else 0)

        rag_context = "SEMANTICALLY RELEVANT HOSPITALS (via RAG):\n"
        citations = []

        for r in rag_results:
            rag_context += f"""
- {r['name']} | {r['city']}, {r['region']}
  Type: {r['facilityType']}
  Capabilities: {str(r['capability'])[:200]}
  Specialties: {str(r['specialties'])[:150]}
  Relevance Score: {r['score']:.3f}
"""
            citations.append({
                "hospital": r['name'],
                "city": r['city'],
                "region": r['region'],
                "field": "RAG semantic search",
                "value": str(r['capability'])[:150] if r['capability'] else "General services",
                "relevance": f"Semantic similarity score: {r['score']:.3f}"
            })

        # ── Step 2: SQL Stats ─────────────────────────
        step2_start = time.time()
        keywords = question.lower()
        sql_context = ""

        if any(w in keywords for w in ['desert', 'gap', 'missing', 'no emergency', 'lack']):
            sql_context += f"\nMEDICAL DESERTS:\n{get_medical_deserts()}"
            mlflow.log_param("used_desert_query", True)

        regions = ['accra', 'ashanti', 'northern', 'western', 'central',
                   'volta', 'eastern', 'upper west', 'upper east', 'brong']
        matched_regions = [r for r in regions if r in keywords]
        for region in matched_regions:
            sql_context += f"\nREGION STATS:\n{get_region_stats(region)}"

        step2_time = time.time() - step2_start
        mlflow.log_metric("sql_latency_sec", round(step2_time, 3))
        mlflow.log_metric("regions_queried", len(matched_regions))

        # ── Step 3: LLM Generation ────────────────────
        step3_start = time.time()

        system_prompt = f"""You are a Ghana Healthcare Intelligence Agent helping NGO planners.
You have access to a REAL database of 987 healthcare facilities across Ghana.

{rag_context}
{sql_context}

Instructions:
1. Use the real hospital data above — cite specific hospital names
2. Identify medical deserts (regions with no emergency/ICU care)
3. Give specific numbers from the data
4. End with clear actionable recommendations
5. Be concise and useful for NGO planners
"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=1024,
            temperature=0.3
        )

        answer = response.choices[0].message.content
        step3_time = time.time() - step3_start

        mlflow.log_metric("llm_latency_sec", round(step3_time, 3))
        mlflow.log_metric("answer_length", len(answer))
        mlflow.log_metric("total_latency_sec", round(step1_time + step2_time + step3_time, 3))

        # ── Log full answer as artifact ───────────────
        with open("last_answer.txt", "w") as f:
            f.write(f"Q: {question}\n\nA: {answer}")
        mlflow.log_artifact("last_answer.txt")

        print(f"✅ MLFlow logged: RAG={step1_time:.2f}s | SQL={step2_time:.2f}s | LLM={step3_time:.2f}s")

        agent_steps = [
            {
                "step": 1,
                "action": f"RAG semantic search: '{question}'",
                "result": f"Found {len(rag_results)} hospitals in {step1_time:.2f}s — logged to MLFlow"
            },
            {
                "step": 2,
                "action": "SQL structured query for regional stats",
                "result": f"Retrieved regional data in {step2_time:.2f}s — logged to MLFlow"
            },
            {
                "step": 3,
                "action": "LLM synthesis with Llama-3.1",
                "result": f"Generated {len(answer)} char response in {step3_time:.2f}s — logged to MLFlow"
            }
        ]

        return {
            "answer": answer,
            "citations": citations[:3],
            "agentSteps": agent_steps
        }
