# Comprehensive Disease Database with detailed information for Indian patients

DISEASES_DATABASE = {
    "fever": {
        "name": "Fever/High Temperature",
        "description": "Fever is an elevated body temperature above 98.6°F (37°C), usually indicating your body fighting an infection like flu, cold, or bacterial infection. It's a natural immune response. Most fevers resolve within 3-5 days with rest and fluids. Common causes include viral infections, bacterial infections, or inflammation.",
        "main_symptoms": [
            "Body temperature above 100.4°F (38°C)",
            "Chills and shivering",
            "Headache and body aches",
            "Weakness and fatigue",
            "Loss of appetite",
            "Sweating"
        ],
        "worst_case": "Prolonged high fever (>104°F) with severe symptoms may indicate serious infection requiring hospitalization.",
        "common_causes": ["Flu", "Common Cold", "Typhoid", "Dengue", "Malaria", "UTI"],
        "severity": "low"
    },
    "common_cold": {
        "name": "Common Cold",
        "description": "A viral respiratory infection causing sneezing, cough, and congestion. It's highly contagious and usually harmless, lasting 7-10 days. Spread through respiratory droplets. Most people recover without treatment with rest and hydration.",
        "main_symptoms": [
            "Sneezing",
            "Nasal congestion",
            "Cough",
            "Sore throat",
            "Mild fever",
            "Runny nose"
        ],
        "worst_case": "Can develop into secondary bacterial infection or pneumonia in elderly or immunocompromised patients.",
        "common_causes": ["Rhinovirus", "Environmental exposure", "Weak immunity"],
        "severity": "low"
    },
    "flu": {
        "name": "Influenza (Flu)",
        "description": "A contagious respiratory illness caused by influenza virus, more severe than cold. Characterized by sudden onset of fever, body aches, and cough. Peaks during winter months. Spreads rapidly in communities.",
        "main_symptoms": [
            "Sudden high fever (101-104°F)",
            "Severe body and muscle aches",
            "Fatigue and weakness",
            "Dry cough",
            "Sore throat",
            "Headache",
            "Chills"
        ],
        "worst_case": "Can lead to pneumonia, hospitalization, or death in elderly, young children, or immunocompromised individuals.",
        "common_causes": ["Influenza virus (Type A, B, or C)"],
        "severity": "medium"
    },
    "typhoid": {
        "name": "Typhoid Fever",
        "description": "Bacterial infection from contaminated water/food. Common in India. Causes sustained fever for weeks, abdominal pain, and rose spots rash. Serious but treatable with antibiotics. Preventable by vaccination and clean water.",
        "main_symptoms": [
            "Sustained high fever (104-106°F) for weeks",
            "Headache",
            "Abdominal pain",
            "Rose-colored rash on chest",
            "Diarrhea or constipation",
            "Weakness"
        ],
        "worst_case": "Untreated typhoid can cause intestinal perforation, shock, and death. Requires immediate antibiotic treatment.",
        "common_causes": ["Salmonella typhi bacteria", "Contaminated water/food"],
        "severity": "high"
    },
    "dengue": {
        "name": "Dengue Fever",
        "description": "Mosquito-borne viral infection, common in monsoon season in India. Causes high fever, severe joint pain, and rash. Usually lasts 1-2 weeks. No specific cure, treatment is supportive care.",
        "main_symptoms": [
            "High fever (104-106°F)",
            "Severe joint and muscle pain",
            "Headache behind eyes",
            "Rash starting on torso",
            "Nausea and vomiting",
            "Mild bleeding (nose, gums)"
        ],
        "worst_case": "Dengue hemorrhagic fever with low platelet count can cause severe bleeding and shock requiring hospitalization.",
        "common_causes": ["Aedes mosquito bite"],
        "severity": "high"
    },
    "diabetes": {
        "name": "Type 2 Diabetes",
        "description": "Metabolic disorder where body can't regulate blood sugar properly. Insulin resistance develops gradually. Common in overweight individuals, family history, and poor diet. Manageable with lifestyle changes and medication.",
        "main_symptoms": [
            "Increased thirst",
            "Frequent urination",
            "Fatigue",
            "Blurred vision",
            "Slow-healing wounds",
            "Numbness in feet",
            "Increased appetite"
        ],
        "worst_case": "Uncontrolled diabetes leads to kidney disease, blindness, heart disease, and amputations.",
        "common_causes": ["Obesity", "Family history", "Poor diet", "Sedentary lifestyle"],
        "severity": "high"
    },
    "hypertension": {
        "name": "High Blood Pressure (Hypertension)",
        "description": "Chronic condition where blood pressure stays elevated (140/90 or higher). Called 'silent killer' as often has no symptoms. Risk factor for heart disease and stroke. Managed with lifestyle and medication.",
        "main_symptoms": [
            "Often no symptoms (silent)",
            "Headache",
            "Shortness of breath",
            "Nosebleeds",
            "Chest pain",
            "Dizziness"
        ],
        "worst_case": "Uncontrolled hypertension can cause heart attack, stroke, or kidney disease.",
        "common_causes": ["Obesity", "Stress", "Salt intake", "Family history", "Alcohol"],
        "severity": "high"
    },
    "asthma": {
        "name": "Asthma",
        "description": "Chronic inflammatory airway disease causing breathing difficulty. Triggered by allergens, exercise, or stress. Symptoms range from mild to life-threatening. Managed with inhalers and medications.",
        "main_symptoms": [
            "Wheezing",
            "Shortness of breath",
            "Chest tightness",
            "Cough (especially at night)",
            "Difficulty during exercise"
        ],
        "worst_case": "Severe asthma attacks can cause respiratory failure and death if not treated immediately.",
        "common_causes": ["Allergens", "Exercise", "Air pollution", "Stress", "Viral infections"],
        "severity": "medium"
    },
    "pneumonia": {
        "name": "Pneumonia",
        "description": "Lung infection causing inflammation and fluid accumulation in air sacs. Can be bacterial, viral, or fungal. Presents with fever, cough, and chest pain. More serious than cold or flu.",
        "main_symptoms": [
            "High fever",
            "Cough (with phlegm)",
            "Chest pain when breathing",
            "Shortness of breath",
            "Chills",
            "Weakness"
        ],
        "worst_case": "Severe pneumonia can cause respiratory failure, sepsis, and death, especially in elderly or immunocompromised.",
        "common_causes": ["Streptococcus pneumoniae", "Viral infection", "Aspiration"],
        "severity": "high"
    },
    "tuberculosis": {
        "name": "Tuberculosis (TB)",
        "description": "Serious infectious disease affecting lungs, spread through air. Can be latent (inactive) or active. Common in India. Requires 6-month antibiotic course. Early detection and treatment essential.",
        "main_symptoms": [
            "Persistent cough (>3 weeks)",
            "Cough with blood/phlegm",
            "Chest pain",
            "Fever",
            "Night sweats",
            "Weight loss",
            "Fatigue"
        ],
        "worst_case": "Untreated TB can be fatal and spread to others. Multi-drug resistant TB is harder to treat.",
        "common_causes": ["Mycobacterium tuberculosis bacteria", "Close contact with TB patient"],
        "severity": "critical"
    },
    "headache": {
        "name": "Headache/Migraine",
        "description": "Pain in head/upper neck region. Can be tension-type, migraine, or cluster headache. Most common are tension headaches from stress. Migraines are more severe with nausea.",
        "main_symptoms": [
            "Pain in forehead, temples, or back of head",
            "Nausea and vomiting",
            "Sensitivity to light",
            "Sensitivity to sound",
            "Aura (visual disturbances)",
            "Throbbing sensation"
        ],
        "worst_case": "Sudden severe headache with fever/stiff neck needs emergency care (meningitis).",
        "common_causes": ["Stress", "Dehydration", "Caffeine withdrawal", "Sleep deprivation", "Hormones"],
        "severity": "low"
    },
    "gastroenteritis": {
        "name": "Gastroenteritis (Food Poisoning/Stomach Flu)",
        "description": "Inflammation of stomach and intestines from viral/bacterial infection. Causes vomiting and diarrhea. Usually self-limiting, lasting 24-48 hours. Main concern is dehydration.",
        "main_symptoms": [
            "Vomiting",
            "Diarrhea",
            "Abdominal cramps",
            "Fever",
            "Loss of appetite",
            "Weakness"
        ],
        "worst_case": "Severe dehydration, especially in children and elderly, may require hospitalization.",
        "common_causes": ["Contaminated food/water", "Viral infection", "Bacterial infection"],
        "severity": "medium"
    },
    "urinary_tract_infection": {
        "name": "Urinary Tract Infection (UTI)",
        "description": "Bacterial infection in urinary system (urethra, bladder, kidneys). More common in women. Causes painful urination and frequency. Easily treated with antibiotics.",
        "main_symptoms": [
            "Painful urination (burning sensation)",
            "Frequent urination",
            "Urgent urination",
            "Cloudy urine",
            "Pelvic pain",
            "Fever (if kidney infection)"
        ],
        "worst_case": "Untreated UTI can lead to kidney infection (pyelonephritis) with high fever and back pain.",
        "common_causes": ["E. coli bacteria", "Poor hygiene", "Sexual activity", "Catheter use"],
        "severity": "medium"
    },
    "acidity": {
        "name": "Acidity/GERD",
        "description": "Stomach acid reflux into esophagus causing heartburn. Triggered by spicy food, caffeine, or lying down. Very common in India. Managed with antacids and lifestyle changes.",
        "main_symptoms": [
            "Heartburn (chest burning)",
            "Acid reflux",
            "Bloating",
            "Burping",
            "Nausea",
            "Sore throat"
        ],
        "worst_case": "Chronic GERD can cause Barrett's esophagus leading to esophageal cancer.",
        "common_causes": ["Spicy food", "Caffeine", "Chocolate", "Stress", "Obesity"],
        "severity": "low"
    },
    "skin_infection": {
        "name": "Skin Infection (Fungal/Bacterial)",
        "description": "Infection on skin surface causing rash, itching, redness. Can be fungal (ringworm) or bacterial. Common in hot, humid climate. Treated with topical or oral medicines.",
        "main_symptoms": [
            "Red rash",
            "Itching and burning",
            "Scaling or peeling",
            "Pus-filled spots",
            "Swelling",
            "Oozing"
        ],
        "worst_case": "Untreated skin infection can spread to bloodstream causing sepsis.",
        "common_causes": ["Fungus", "Bacteria", "Poor hygiene", "Moisture", "Weak immunity"],
        "severity": "low"
    },
    "allergies": {
        "name": "Allergies/Allergic Reaction",
        "description": "Immune system overreaction to harmless substance (allergen). Can cause sneezing, itching, rash. Range from mild to severe (anaphylaxis). Managed with antihistamines.",
        "main_symptoms": [
            "Sneezing",
            "Itching (eyes, nose, skin)",
            "Rash or hives",
            "Swelling (face, lips)",
            "Difficulty breathing",
            "Watery eyes"
        ],
        "worst_case": "Severe allergic reaction (anaphylaxis) can cause breathing difficulty and require emergency treatment.",
        "common_causes": ["Pollen", "Dust mites", "Pet dander", "Foods", "Medications"],
        "severity": "low"
    },
    "anxiety": {
        "name": "Anxiety Disorder",
        "description": "Mental health condition causing excessive worry and panic. Involves physical symptoms like rapid heartbeat. Triggered by stress or trauma. Treatable with therapy and medication.",
        "main_symptoms": [
            "Excessive worry",
            "Rapid heartbeat",
            "Shortness of breath",
            "Dizziness",
            "Sweating",
            "Sleep problems",
            "Restlessness"
        ],
        "worst_case": "Severe anxiety can interfere with daily functioning and relationships.",
        "common_causes": ["Stress", "Trauma", "Genetic", "Sleep deprivation"],
        "severity": "medium"
    },
    "anemia": {
        "name": "Anemia",
        "description": "Low red blood cell count reducing oxygen carrying capacity. Causes fatigue and weakness. Common in India due to poor nutrition. Treated with iron supplements and diet changes.",
        "main_symptoms": [
            "Fatigue",
            "Weakness",
            "Pale skin",
            "Shortness of breath",
            "Dizziness",
            "Cold hands/feet",
            "Headaches"
        ],
        "worst_case": "Severe anemia can cause heart problems and require blood transfusion.",
        "common_causes": ["Iron deficiency", "B12 deficiency", "Heavy bleeding", "Chronic disease"],
        "severity": "medium"
    },
    "kidney_stones": {
        "name": "Kidney Stones",
        "description": "Mineral deposits in kidneys causing severe pain when passing through urinary tract. Caused by dehydration and mineral imbalance. Some pass naturally, others need treatment.",
        "main_symptoms": [
            "Severe flank pain",
            "Painful urination",
            "Bloody urine",
            "Nausea and vomiting",
            "Fever",
            "Frequent urination"
        ],
        "worst_case": "Untreated kidney stones can cause urinary blockage and kidney damage.",
        "common_causes": ["Dehydration", "High calcium diet", "Family history", "Urinary infections"],
        "severity": "high"
    },
    "arthritis": {
        "name": "Arthritis (Joint Inflammation)",
        "description": "Inflammation of joints causing pain and stiffness. Can be osteoarthritis (wear and tear) or rheumatoid (autoimmune). Common with age. Managed with medication and exercise.",
        "main_symptoms": [
            "Joint pain",
            "Stiffness",
            "Swelling",
            "Reduced mobility",
            "Warmth around joints",
            "Morning stiffness"
        ],
        "worst_case": "Progressive arthritis can cause permanent joint damage and disability.",
        "common_causes": ["Age", "Injury", "Genetics", "Autoimmune", "Obesity"],
        "severity": "medium"
    },
    "back_pain": {
        "name": "Back Pain",
        "description": "Pain in back region, often from poor posture or muscle strain. Can be acute (sudden) or chronic (long-term). Most cases improve with rest and exercises.",
        "main_symptoms": [
            "Lower or upper back pain",
            "Muscle stiffness",
            "Reduced mobility",
            "Radiating pain to legs",
            "Numbness or tingling"
        ],
        "worst_case": "Severe back pain with numbness/weakness needs immediate evaluation for nerve compression.",
        "common_causes": ["Muscle strain", "Poor posture", "Herniated disc", "Stress"],
        "severity": "low"
    }
}


def get_all_diseases():
    """Return list of all disease names"""
    return list(DISEASES_DATABASE.keys())


def get_disease_info(disease_name):
    """Get detailed info about a specific disease"""
    return DISEASES_DATABASE.get(disease_name.lower())


def search_diseases_by_symptom(symptom):
    """Find diseases that match a symptom"""
    matching = []
    symptom_lower = symptom.lower()
    for disease_key, disease_info in DISEASES_DATABASE.items():
        for sym in disease_info["main_symptoms"]:
            if symptom_lower in sym.lower():
                matching.append(disease_key)
                break
    return matching
