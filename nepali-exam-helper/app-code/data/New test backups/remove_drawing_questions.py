import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filename, data):
    with open(os.path.join(DATA_DIR, filename), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {filename}")

def fix_exam_2():
    filename = "see_2081_math_practice_2.json"
    data = load_json(filename)
    questions = data[1]["questions"]
    
    # Q16b: Tree Diagram -> Probability of getting a Face Card
    q16 = questions[15]
    
    # Clean Q16a Nepali text (Remove 'draw tree diagram')
    if len(q16["sub_questions"]) >= 1:
        qa = q16["sub_questions"][0]
        if "चित्र" in qa.get("questionNepali", ""):
            qa["questionNepali"] = "कुल नमुना क्षेत्र (Sample Space) लेख्नुहोस् ।"
            # English is already "Write the total sample space." which is fine.

    if len(q16["sub_questions"]) >= 2:
        q16["sub_questions"][1] = {
            "labelNepali": "ख",
            "labelEnglish": "b",
            "questionNepali": "एउटा गुलाम (Jack) पर्ने सम्भाव्यता निकाल्नुहोस् ।",
            "questionEnglish": "Find the probability of getting a Jack.",
            "marksNepali": "३",
            "marksEnglish": 3,
            "answerNepali": "१/१३",
            "answerEnglish": "1/13",
            "explanationNepali": "जम्मा गुलाम = 4. सम्भाव्यता = 4/52 = 1/13.",
            "explanationEnglish": "Total Jacks = 4. Probability = 4/52 = 1/13."
        }
    save_json(filename, data)

def fix_exam_3():
    filename = "see_2081_math_practice_3.json"
    data = load_json(filename)
    questions = data[1]["questions"]
    
    # Q16b: Tree Diagram -> Probability.
    q16 = questions[15]
    
    # Clean Q16a Nepali text
    if len(q16["sub_questions"]) >= 1:
        qa = q16["sub_questions"][0]
        if "चित्र" in qa.get("questionNepali", ""):
            qa["questionNepali"] = "निलो बल नपर्ने सम्भाव्यता कति हुन्छ ?"
            # Ensure it matches original question intent or just clean the diagram part.
            # Original: "What is probability of not getting blue?"
            # Let's ensure Nepali matches that.

    if len(q16["sub_questions"]) >= 2:
        q16["sub_questions"][1] = {
            "labelNepali": "ख",
            "labelEnglish": "b",
            "questionNepali": "रातो वा हरियो बल पर्ने सम्भाव्यता निकाल्नुहोस् ।",
            "questionEnglish": "Find the probability of getting a Red or Green ball.",
            "marksNepali": "३",
            "marksEnglish": 3,
            "answerNepali": "२/३",
            "answerEnglish": "2/3",
            "explanationNepali": "रातो + हरियो = 3 + 5 = 8. सम्भाव्यता = 8/12 = 2/3.",
            "explanationEnglish": "Red + Green = 8. Probability = 8/12 = 2/3."
        }
    save_json(filename, data)

def fix_exam_4():
    filename = "see_2081_math_practice_4.json"
    data = load_json(filename)
    questions = data[1]["questions"]
    
    # Q1b: Venn Diagram -> Oranges Only
    q1 = questions[0]
    # Check if Q1b is the diagram question
    for sq in q1["sub_questions"]:
        if "venn" in sq.get("questionEnglish", "").lower() or "diagram" in sq.get("questionEnglish", "").lower():
            sq["questionNepali"] = "सुन्तला मात्र मन पराउने मानिसहरूको प्रतिशत पत्ता लगाउनुहोस् ।"
            sq["questionEnglish"] = "Find the percentage of people who like oranges only."
            sq["answerNepali"] = "४०%"
            sq["answerEnglish"] = "40%"
            sq["explanationNepali"] = "सुन्तला मात्र = 60% - 20% = 40%."
            sq["explanationEnglish"] = "Oranges only = 60% - 20% = 40%."
            # Correct Q1c (Previously Apple Only): It's still valid. 
            # Note: Q1c in my prev injection was "Apple only". Q1b was Venn. 
            # I am changing Q1b to "Orange Only". Good.
            
    # Q11b: Verify Diagrammatically -> Find height
    # Context: Rectangle Area = 40. Triangle Area = 20.
    q11 = questions[10]
    for sq in q11["sub_questions"]:
        if "verify" in sq.get("questionEnglish", "").lower():
            sq["questionNepali"] = "यदि आयतको आधार १० से.मि. छ भने, यसको उचाइ पत्ता लगाउनुहोस् ।"
            sq["questionEnglish"] = "If the base of the rectangle is 10 cm, find its height."
            sq["answerNepali"] = "४ से.मि."
            sq["answerEnglish"] = "4 cm"
            sq["explanationNepali"] = "Area = b * h => 40 = 10 * h => h = 4."
            sq["explanationEnglish"] = "Area = b * h => 40 = 10 * h => h = 4."
            
    # Q16c: Tree Diagram -> Prob of Exactly One Head
    # Context: 2 coins.
    q16 = questions[15]
    for sq in q16["sub_questions"]:
        if "tree" in sq.get("questionEnglish", "").lower():
            sq["questionNepali"] = "एक पटक मात्र हेड आउने सम्भाव्यता कति हुन्छ?"
            sq["questionEnglish"] = "What is the probability of getting exactly one Head?"
            sq["answerNepali"] = "१/२"
            sq["answerEnglish"] = "1/2"
            sq["explanationNepali"] = "HT, TH -> 2/4 = 1/2."
            sq["explanationEnglish"] = "HT, TH -> 2/4 = 1/2."

    save_json(filename, data)

if __name__ == "__main__":
    fix_exam_2()
    fix_exam_3()
    fix_exam_4()
