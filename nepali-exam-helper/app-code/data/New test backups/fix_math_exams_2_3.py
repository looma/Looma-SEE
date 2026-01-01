import json
import os

files = [
    r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_2.json",
    r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_3.json"
]

NEW_SUBQUESTION = {
    "labelNepali": "ख",
    "labelEnglish": "b",
    "questionNepali": "माथिको सम्भाव्यतालाई वृक्ष चित्रमा प्रस्तुत गर्नुहोस् ।",
    "questionEnglish": "Show the above probability in a tree diagram.",
    "marksNepali": "३",
    "marksEnglish": 3,
    "answerNepali": "वृक्ष चित्र",
    "answerEnglish": "Tree diagram",
    "explanationNepali": "सबै सम्भावित परिणामहरूलाई हाँगाहरूद्वारा देखाउनुहोस्।",
    "explanationEnglish": "Show all possible outcomes using branches."
}

def fix_file(filepath):
    print(f"Fixing {os.path.basename(filepath)}...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Standard math exam structure: data[1]["questions"]
    questions = data[1]["questions"]
    
    # Target Question 16 (index 15)
    if len(questions) >= 16:
        q16 = questions[15]
        
        # Check if it already has 'b' part to avoid duplication
        subs = q16.get("sub_questions", [])
        has_b = any(sq.get("labelEnglish") == "b" for sq in subs)
        
        if not has_b:
            subs.append(NEW_SUBQUESTION)
            q16["sub_questions"] = subs
            print("  Added Tree Diagram subquestion to Q16.")
        else:
            print("  Q16 already has subquestion 'b'. Skipping.")
            
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    for f in files:
        if os.path.exists(f):
            fix_file(f)
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
