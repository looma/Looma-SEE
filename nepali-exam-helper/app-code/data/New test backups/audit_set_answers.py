import os
import json
import sys

# Force utf-8 printing for Windows console
sys.stdout.reconfigure(encoding='utf-8')

target_dir = r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups"
files = [f for f in os.listdir(target_dir) if f.endswith(".json") and "math" in f]

print("Scanning for answers in Math files...")

for filename in sorted(files):
    filepath = os.path.join(target_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Simple substring check first
            if "..." in content or "…" in content:
                print(f"File {filename} contains ellipsis!")
            
            data = json.loads(content)
            
        questions = []
        if isinstance(data, list) and len(data) > 1 and "questions" in data[1]:
            questions = data[1]["questions"]
            
        for q in questions:
            q_num = q.get("question_numberEnglish", "?")
            if "sub_questions" in q:
                for sub in q["sub_questions"]:
                    ans_en = str(sub.get("answerEnglish", "")).strip()
                    
                    # Check for set braces
                    if "{" in ans_en:
                        print(f"\n{filename} Q{q_num}{sub.get('labelEnglish')}: {ans_en}")
                        
                        # Heuristic for "3 of 8"
                        items = ans_en.count(",") + 1
                        if items == 3 and "coin" in str(q).lower():
                             print("  *** MATCHES '3 items' CRITERIA ***")

    except Exception as e:
        print(f"Error reading {filename}: {e}")
