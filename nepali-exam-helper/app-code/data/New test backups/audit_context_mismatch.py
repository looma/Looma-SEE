import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def audit(filename):
    print(f"\n--- Auditing {filename} ---")
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    questions = data[1]["questions"]
    
    for i, q in enumerate(questions):
        context = q.get("context", {}).get("English", "NO CONTEXT")
        print(f"Q{i+1} Context: {context[:100]}...")
        
        if "sub_questions" in q:
            for sq in q["sub_questions"]:
                label = sq.get("labelEnglish", "?")
                text = sq.get("questionEnglish", "NO TEXT")
                print(f"   ({label}) {text[:100]}...")

audit("see_2081_math_practice_4.json") # The main culprit (full injections)
audit("see_2081_math_practice_2.json") # Check Q16
audit("see_2081_math_practice_3.json") # Check Q16
