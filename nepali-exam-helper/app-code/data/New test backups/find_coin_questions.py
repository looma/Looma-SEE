import os
import json

target_dir = r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups"

print(f"Scanning for 'Three coins' in {target_dir}...")

files = [f for f in os.listdir(target_dir) if f.endswith(".json")]

for filename in files:
    filepath = os.path.join(target_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        questions = []
        if isinstance(data, list) and len(data) > 1 and "questions" in data[1]:
            questions = data[1]["questions"]
            
        for q in questions:
            q_text = q.get("context", {}).get("English", "") + " " + q.get("questionEnglish", "")
            if "coins" in q_text.lower() or "coin" in q_text.lower():
                print(f"\nFound 'coin' question in {filename}, Q{q.get('question_numberEnglish')}")
                print(f"  Context: {q.get('context', {}).get('English', '')[:100]}...")
                
                if "sub_questions" in q:
                    for sub in q["sub_questions"]:
                        ans = sub.get("answerEnglish", "")
                        print(f"    Sub Q{sub.get('labelEnglish')}: Answer: {ans}")
                        if "..." in ans or "…" in ans:
                            print("    *** FOUND ELLIPSIS ***")
                        
    except Exception as e:
        print(f"Error reading {filename}: {e}")
