import json
import os
import re

files = [
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_1.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_2.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_3.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_4.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_5.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_6.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_7.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_8.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_9.json"
]

def check_incomplete_answers(file_path):
    issues = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []

    # Helper recursive function to find questions
    questions = []
    
    # Depending on structure, questions might be in item 1 (metadata is 0)
    # The current structure seems to be a list where item index 1 has "questions"
    
    if isinstance(data, list) and len(data) > 1 and "questions" in data[1]:
        questions = data[1]["questions"]
    else:
        # Fallback if structure is different
        pass

    for q in questions:
        q_num = q.get("question_numberEnglish", "?")
        
        # Check subquestions
        if "sub_questions" in q:
            for sub in q["sub_questions"]:
                label = sub.get("labelEnglish", "?")
                ans_en = sub.get("answerEnglish", "")
                ans_np = sub.get("answerNepali", "")
                
                # Check for "..." or "…"
                if "..." in str(ans_en) or "…" in str(ans_en) or "..." in str(ans_np) or "…" in str(ans_np):
                    issues.append({
                        "question": f"{q_num}{label}",
                        "answerEnglish": ans_en,
                        "answerNepali": ans_np
                    })
        else:
             # Check main question if no subquestions (less likely in this schema)
             pass

    return issues

print("Scanning for incomplete answers...")
total_issues = 0
for file_path in files:
    if os.path.exists(file_path):
        issues = check_incomplete_answers(file_path)
        if issues:
            print(f"\nFile: {os.path.basename(file_path)}")
            for issue in issues:
                print(f"  Question {issue['question']}:")
                print(f"    English: {issue['answerEnglish']}")
                print(f"    Nepali:  {issue['answerNepali']}")
            total_issues += len(issues)
    else:
        print(f"File not found: {file_path}")

print(f"\nTotal incomplete answers found: {total_issues}")
