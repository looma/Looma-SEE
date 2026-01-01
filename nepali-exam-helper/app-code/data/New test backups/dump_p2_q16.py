import json
import os
import sys

# Force utf-8 printing
sys.stdout.reconfigure(encoding='utf-8')

filepath = r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_2.json"

print(f"Checking file: {filepath}")

if not os.path.exists(filepath):
    print("File not found!")
    sys.exit(1)

stats = os.stat(filepath)
print(f"File Size: {stats.st_size} bytes")

try:
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"Total Lines: {len(lines)}")
        f.seek(0)
        data = json.load(f)

    if isinstance(data, list) and len(data) > 1 and "questions" in data[1]:
        questions = data[1]["questions"]
        for q in questions:
            if q.get("question_numberEnglish") == 16:
                print("\n--- FOUND QUESTION 16 ---")
                print(json.dumps(q, indent=2, ensure_ascii=False))
                
                # Check for "coin" or "card" in the raw text of this question
                q_text = json.dumps(q, ensure_ascii=False).lower()
                if "coin" in q_text:
                    print("\n[ANALYSIS] Contains 'coin'")
                if "card" in q_text:
                    print("\n[ANALYSIS] Contains 'card'")
                if "sample space" in q_text:
                    print("[ANALYSIS] Contains 'sample space'")
                    
    else:
        print("Incorrect JSON structure, could not find questions list")

except Exception as e:
    print(f"Error reading JSON: {e}")
