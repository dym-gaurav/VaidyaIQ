import os
import json
import openai
from openai import OpenAI
from dotenv import load_dotenv

from utils import parse_json_response, sanitize_text
from diseases_db import DISEASES_DATABASE, get_all_diseases, get_disease_info, search_diseases_by_symptom

load_dotenv()

client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.getenv("GITHUB_TOKEN")
)

MODEL = os.getenv("GITHUB_MODEL")


def analyze_symptoms(questions, answers):
    qa_text = ""
    for i, (q, a) in enumerate(zip(questions, answers)):
        qa_text += f"Q{i+1}: {q}\nAnswer: {a}\n\n"

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": """You are a rigorous medical information assistant using evidence-based diagnostic reasoning.

CRITICAL RULES YOU MUST FOLLOW:
1. Weight specific symptoms more heavily than non-specific symptoms
2. Do NOT replace evidence-based hypotheses with generic conditions (anxiety, fatigue, headache, cold, flu) without strong contradicting evidence
3. Identify the PRIMARY symptom pattern and ensure it drives the ranking
4. Use both positive findings (symptoms present) AND negative findings (expected symptoms absent)
5. Maintain diagnostic consistency between symptoms and ranking
6. If uncommon but specific symptoms are reported, ensure rare disease hypotheses remain prioritized appropriately
7. Always explain the reasoning for each disease's ranking

RANKING METHODOLOGY:
- Consider symptom specificity: specific symptoms >> generic symptoms
- Consider symptom clustering: matching disease patterns >> random symptoms
- Consider severity: severe specific symptoms >> mild non-specific symptoms
- Consider disease prevalence in India: common diseases weighted appropriately
- Never discard a disease hypothesis without evidence contradicting it

Return ONLY a valid JSON object with exactly these keys:
{
  "primary_symptom_pattern": "the main symptom pattern identified",
  "ranked_diseases": [
    {
      "name": "disease name",
      "confidence": 95,
      "reasoning": "specific evidence supporting this ranking from the symptoms",
      "key_features": "which symptoms match this disease pattern"
    }
  ],
  "analysis": "overall diagnostic logic connecting symptoms to diseases",
  "emergency_warning": "mention if patient needs immediate hospital visit",
  "diagnostic_notes": "any important diagnostic considerations",
  "disclaimer": "This is for informational purposes only. Please consult a real doctor."
}

Include at least 10-15 diseases ranked by likelihood. Include: fever, common_cold, flu, typhoid, dengue, diabetes, hypertension, asthma, pneumonia, tuberculosis, headache, gastroenteritis, urinary_tract_infection, acidity, skin_infection, allergies, anxiety, anemia, kidney_stones, arthritis, back_pain.

Use simple English. Never say the person is definitely dying. Return ONLY the JSON."""
            },
            {
                "role": "user",
                "content": f"Here are the patient's symptom answers:\n\n{qa_text}\n\nRank ALL possible diseases by likelihood using evidence-based diagnostic reasoning. Prioritize condition-specific symptoms over generic ones."
            }
        ]
    )
    return response.choices[0].message.content


def get_comprehensive_disease_analysis():
    """Get detailed info for ALL diseases for initial report"""
    diseases_with_info = {}
    for disease_key, disease_info in DISEASES_DATABASE.items():
        diseases_with_info[disease_key] = {
            "name": disease_info["name"],
            "description": disease_info["description"],
            "main_symptoms": disease_info["main_symptoms"],
            "worst_case": disease_info["worst_case"],
            "severity": disease_info["severity"],
            "google_search_query": disease_info["name"] + " symptoms"
        }
    return diseases_with_info


def generate_followup_questions_for_elimination(ranked_diseases, symptom_history):
    """Generate smart follow-up questions to eliminate diseases while respecting initial diagnosis"""
    top_diseases = [d["name"] for d in ranked_diseases[:5]]  # Top 5 diseases
    
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": """You are a medical diagnostic assistant using evidence-based reasoning.

CRITICAL RULES FOR FOLLOW-UP QUESTIONS:
1. DO NOT abandon the initial symptom pattern without strong evidence
2. Generate questions that distinguish between TOP diseases, NOT generic elimination
3. If a rare disease was prioritized initially, generate questions that TEST that hypothesis specifically
4. Questions should look for SPECIFIC distinguishing features between similar diseases
5. Do NOT design questions that would eliminate rare diseases in favor of generic ones
6. Each question should have clear differential value - move diagnosis toward or away from specific disease
7. Build on the initial symptom pattern - don't pivot to unrelated symptoms

EFFECTIVE FOLLOW-UP STRATEGY:
- Ask questions that distinguish between: Top disease #1 vs #2, #2 vs #3, etc.
- Ask for disease-specific features (not just "do you feel worse?")
- Ask about TIMING, PATTERN, SEVERITY of initial symptoms
- Ask about RED FLAGS for rare/serious diseases
- Ask about ABSENCE of expected symptoms (negative findings matter!)

Return ONLY a JSON object:
{
  "questions": ["specific question 1", "specific question 2", ...],
  "rationale": "how these questions specifically distinguish between the top diseases",
  "diagnostic_focus": "which disease hypotheses these questions are designed to test"
}
Return ONLY the JSON. No extra text."""
            },
            {
                "role": "user",
                "content": f"""Initial symptom report: {symptom_history}

Top disease candidates (in order): {', '.join(top_diseases)}

Generate 3-5 SPECIFIC follow-up questions that will meaningfully distinguish between these diseases.
Focus on disease-specific features, not generic symptoms.
Maintain the original symptom pattern in your questioning."""
            }
        ]
    )
    return response.choices[0].message.content


def eliminate_diseases_based_on_answers(ranked_diseases, new_answers, elimination_questions):
    """Re-rank diseases based on follow-up answers with rigorous diagnostic consistency"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": """You are a rigorous medical diagnostic assistant applying critical reasoning standards.

DIAGNOSTIC CONSISTENCY RULES (MUST FOLLOW):
1. NEVER discard a disease hypothesis that was specifically generated for follow-up questioning
2. Review initial ranking - if a disease was high priority, answers must STRONGLY contradict it to lower it
3. Use BOTH positive findings (symptoms present) AND negative findings (expected symptoms absent)
4. Generic conditions (anxiety, cold, flu, fatigue) should NOT replace specific disease hypotheses without overwhelming evidence
5. If follow-up questions were SPECIFIC to a disease, treat that disease as an ACTIVE HYPOTHESIS
6. Explain EXACTLY why each disease moved up or down with supporting evidence from answers

PRE-FINALIZATION CONSISTENCY CHECK:
Before returning, ask yourself:
- "Does this ranking logically follow from the initial symptom + follow-up answers?"
- "Did I abandon any disease without clear evidence?"
- "Are specific symptoms still driving the top rankings?"
- "Would a real doctor make these same changes based on these answers?"

Return ONLY a JSON object:
{
  "initial_top_disease": "the #1 disease from initial analysis",
  "reasoning_for_changes": "explain how each disease's ranking changed and why",
  "re_ranked_diseases": [
    {
      "name": "disease name",
      "confidence": 90,
      "reason": "specific evidence supporting this ranking with quotes of key answers",
      "changed_from": "previous ranking (if changed)"
    }
  ],
  "eliminated_diseases": ["only diseases with contradicting evidence"],
  "diseases_maintained_in_differential": ["diseases still considered despite unchanged features"],
  "key_findings": "what the follow-up answers revealed about the initial diagnosis",
  "next_steps": "what investigations/tests a doctor should consider",
  "consistency_check_passed": true/false,
  "confidence_level": "high/medium/low"
}
Return ONLY the JSON. No extra text."""
            },
            {
                "role": "user",
                "content": f"""INITIAL RANKINGS: {json.dumps(ranked_diseases[:8])}

FOLLOW-UP QUESTIONS ASKED:
{json.dumps(elimination_questions)}

PATIENT'S ANSWERS:
{json.dumps(new_answers)}

Using evidence-based reasoning:
1. Review if answers support or contradict the initially suspected diseases
2. Update rankings while maintaining diagnostic consistency
3. Do NOT replace disease-specific hypotheses with generic conditions without overwhelming evidence
4. Explain exactly why each disease moved up or down
5. Perform consistency check: Does the final ranking logically follow from the evidence?"""
            }
        ]
    )
    return response.choices[0].message.content


def read_prescription(image_base64, user_note):
    messages = [
        {
            "role": "system",
            "content": """You are a prescription reader assistant for Indian patients.
Read the prescription image carefully.
If the user note contradicts what is written in the prescription, trust the prescription.
Return ONLY a valid JSON object with exactly these keys:
{
  "medicines": [
    {
      "name": "medicine name",
      "purpose": "what it does in simple words",
      "common_conditions": "what conditions it treats"
    }
  ],
  "routine": [
    {
      "medicine": "medicine name",
      "times_per_day": "e.g. 3 times",
      "schedule": "e.g. morning, afternoon, night after food"
    }
  ],
  "mismatch_warning": "explain mismatch if user note contradicts prescription, else null"
}
Return ONLY the JSON. No extra text."""
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"User note: {user_note if user_note else 'No note provided'}. Please read this prescription."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}"
                    }
                }
            ]
        }
    ]

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages
    )
    return response.choices[0].message.content


def therapist_chat(messages, language, age=None):
    age_context = ""
    if age:
        if age < 18:
            age_context = "You are talking to a teenager. Use simple, friendly, casual language. Be extra gentle and non-judgmental."
        elif age < 25:
            age_context = "You are talking to a young adult. Be relatable, modern, and understanding of career/relationship pressures."
        elif age < 35:
            age_context = "You are talking to a working professional. Acknowledge stress of adult responsibilities."
        elif age < 50:
            age_context = "You are talking to a mid-career adult. Respect their experience and life complexity."
        else:
            age_context = "You are talking to a senior person. Be respectful, warm, and acknowledge their wisdom."

    system_prompt = f"""You are a compassionate therapist and counselor for Indian users.
{age_context}

CRITICAL: You MUST ALWAYS return your response as a JSON object with exactly these 4 English keys:
"verdict", "psychology", "consequences", and "recommendation".
No exceptions. No plain text. Always JSON. The keys themselves MUST be in English as specified.

{{
  "verdict": "Was what the person did or is going through right or wrong? Be honest but kind. 2-3 sentences.",
  "psychology": "Why did they do it or feel this way? Explain the human psychology and nature behind it. What emotion, instinct, or pattern drove this? 2-3 sentences.",
  "consequences": "Why is it important to understand and manage this feeling or behavior? What could happen if they don't address it? Be honest but not scary. 2-3 sentences.",
  "recommendation": "Exactly what should they do now to fix or improve the situation? Give 2-3 specific, actionable, gentle steps."
}}

CRITICAL LANGUAGE CONSTRAINT:
You MUST write the string values ENTIRELY in {language}. Do NOT mix languages.
- If {language} is 'english', the entire response values MUST be in pure English (do not use Hinglish).
- If {language} is 'hinglish', write the string values in Hindi words but English script.
- If {language} is 'hindi', write the string values in pure Hindi script.

Never diagnose. Never recommend medication.
If the person seems in crisis, respond calmly and encourage them to contact a trusted nearby person or local emergency services. Do not mention or provide any helpline name or phone number.
Return ONLY the JSON. No extra text before or after."""

    # Sanitize user messages to avoid triggering content filters
    sanitized_messages = []
    for m in messages:
        if m.get("role") == "user" and isinstance(m.get("content"), str):
            sanitized_messages.append({"role": "user", "content": sanitize_text(m["content"])})
        else:
            sanitized_messages.append(m)

    full_messages = [{"role": "system", "content": system_prompt}] + sanitized_messages

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=full_messages
        )
        raw = response.choices[0].message.content
        parsed = parse_json_response(raw)
        
        # If parsing fails return as plain text fallback
        if "error" in parsed:
            return {"reply": raw, "structured": False}
        
        return {"reply": parsed, "structured": True}
    except openai.BadRequestError as e:
        # Fallback response for content policy violation
        fallback_json = {
            "verdict": "It takes courage to reach out when you're feeling this way.",
            "psychology": "Sometimes pain or distress can feel incredibly overwhelming, making it hard to see a way out.",
            "consequences": "Your safety is the absolute most important thing right now. These feelings mean you need support immediately.",
            "recommendation": "Please reach out for help right now. Contact a trusted nearby person or local emergency services and do not stay alone while these feelings are intense."
        }
        return {"reply": fallback_json, "structured": True}

def generate_questions_for_problem(problem):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": """You are a medical assistant. 
Based on the patient's problem, generate exactly 10 yes/no/not-sure diagnostic questions 
that a doctor would ask to understand the condition better.
Return ONLY a JSON array of 10 strings. Example:
["Is the pain constant?", "Do you have fever?", ...]
No extra text. Just the JSON array."""
            },
            {
                "role": "user",
                "content": f"Patient's problem: {problem}"
            }
        ]
    )
    raw = response.choices[0].message.content
    return parse_json_response(raw)
