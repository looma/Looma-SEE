import json
import os
import re

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
KEYWORDS = ["draw", "construct", "diagram", "plot", "graph", "sketch", "figure", "map", "चित्र", "बनाउनु", "खिच्नु", "देखाउनु", "tree", "venn"]

files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]

def audit_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"{filename} not found.")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = []
    if isinstance(data, list):
         questions = data[1]["questions"]
    
    print(f"\nScanning {filename}...")
    count = 0
    for q_idx, q in enumerate(questions):
        if "sub_questions" in q:
            for sq_idx, sq in enumerate(q["sub_questions"]):
                text_en = sq.get("questionEnglish", "").lower()
                text_ne = sq.get("questionNepali", "")
                
                found_kw = []
                for kw in KEYWORDS:
                    if kw in text_en or kw in text_ne:
                        found_kw.append(kw)
                
                if found_kw:
                    count += 1
                    s_text = text_en[:60].encode('ascii', 'ignore').decode('ascii')
                    kw_text = found_kw[0].encode('ascii', 'ignore').decode('ascii')
                    print(f"  Q{q_idx+1}.{sq.get('labelEnglish', '?')} kw:'{kw_text}': {s_text}...")

audit_file("see_2081_math_practice_1.json")
audit_file("see_2081_math_practice_2.json")
audit_file("see_2081_math_practice_3.json")
audit_file("see_2081_math_practice_4.json")
audit_file("see_2081_math_practice_5.json")
