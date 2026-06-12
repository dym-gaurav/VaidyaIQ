from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from prompts import (
    analyze_symptoms, read_prescription, therapist_chat,
    generate_questions_for_problem, get_comprehensive_disease_analysis,
    generate_followup_questions_for_elimination, eliminate_diseases_based_on_answers
)
from utils import encode_image, parse_json_response
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"message": "VaidyaIQ backend is running!"})


@app.route("/api/chat-doctor", methods=["POST"])
def chat_doctor():
    data = request.get_json()
    questions = data.get("questions", [])
    answers = data.get("answers", [])
    raw = analyze_symptoms(questions, answers)
    result = parse_json_response(raw)
    return jsonify(result)


@app.route("/api/prescription", methods=["POST"])
def prescription():
    image_file = request.files.get("image")
    user_note = request.form.get("note", "")
    if not image_file:
        return jsonify({"error": "No image uploaded"}), 400
    image_base64 = encode_image(image_file)
    raw = read_prescription(image_base64, user_note)
    result = parse_json_response(raw)
    return jsonify(result)

@app.route("/api/therapist", methods=["POST"])
def therapist():
    data = request.get_json()
    messages = data.get("messages", [])
    language = data.get("language", "english")
    age = data.get("age", None)
    result = therapist_chat(messages, language, age)
    return jsonify(result)

@app.route("/api/generate-questions", methods=["POST"])
def generate_questions():
    data = request.get_json()
    problem = data.get("problem", "")
    from prompts import generate_questions_for_problem
    questions = generate_questions_for_problem(problem)
    return jsonify({"questions": questions})


@app.route("/api/diseases-comprehensive", methods=["GET"])
def get_all_diseases_info():
    """Get comprehensive info for all diseases"""
    diseases = get_comprehensive_disease_analysis()
    return jsonify({"diseases": diseases})


@app.route("/api/generate-followup-questions", methods=["POST"])
def generate_followup_questions():
    """Generate smart follow-up questions to eliminate diseases"""
    data = request.get_json()
    ranked_diseases = data.get("ranked_diseases", [])
    symptom_history = data.get("symptom_history", "")
    
    raw = generate_followup_questions_for_elimination(ranked_diseases, symptom_history)
    result = parse_json_response(raw)
    return jsonify(result)


@app.route("/api/eliminate-diseases", methods=["POST"])
def eliminate_diseases():
    """Re-rank diseases based on follow-up answers"""
    data = request.get_json()
    ranked_diseases = data.get("ranked_diseases", [])
    new_answers = data.get("new_answers", [])
    elimination_questions = data.get("elimination_questions", [])
    
    raw = eliminate_diseases_based_on_answers(ranked_diseases, new_answers, elimination_questions)
    result = parse_json_response(raw)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)