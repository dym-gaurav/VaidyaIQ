import base64
import json
import re

MEDICAL_TERMS = [
    "fever", "diabetes", "blood pressure", "hypertension", "infection",
    "antibiotic", "paracetamol", "ibuprofen", "insulin", "cholesterol",
    "kidney", "liver", "heart", "lung", "stomach", "thyroid", "anemia",
    "vitamin", "calcium", "hemoglobin", "ECG", "MRI", "CT scan", "X-ray",
    "surgery", "fracture", "inflammation", "allergy", "asthma", "migraine",
    "depression", "anxiety", "stress", "panic attack", "blood sugar",
    "Dolo", "Crocin", "Pan-D", "Azithromycin", "Metformin", "Atorvastatin"
]


def encode_image(file):
    file_bytes = file.read()
    return base64.b64encode(file_bytes).decode("utf-8")


def parse_json_response(text):
    try:
        # Strip markdown code fences if present
        clean = re.sub(r"```json|```", "", text).strip()
        return json.loads(clean)
    except Exception as e:
        return {"error": f"Could not parse response: {str(e)}", "raw": text}


def format_go_buttons(text):
    for term in MEDICAL_TERMS:
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        text = pattern.sub(f'<<<GOBTN:{term}>>>', text, count=1)
    return text

def sanitize_text(text):
    """Replace words that might trigger Azure OpenAI content filters."""
    replacements = {
        r"\bkill myself\b": "give up",
        r"\bsuicide\b": "giving up",
        r"\bend my life\b": "stop trying",
        r"\bdie\b": "fade away",
        r"\bcut myself\b": "hurt myself",
        r"\bcutting myself\b": "hurting myself",
        r"\bself harm\b": "hurt myself",
        r"\bself-harm\b": "hurt myself"
    }
    for pattern, repl in replacements.items():
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    return text