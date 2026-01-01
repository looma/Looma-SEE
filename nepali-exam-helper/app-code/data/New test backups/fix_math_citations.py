import json
import os
import re

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

LESSON_MAP = {
    1: 1,   # Sets
    2: 2,   # Tax / CI
    3: 3,   # Growth / Deprec
    4: 4,   # Currency / Exchange (Confirmed Lesson 4 in PDF scan)
    5: 5,   # Mensuration
    6: 5,   # Mensuration
    7: 5,   # Mensuration
    8: 6,   # Sequences
    9: 7,   # Quadratic Eq
    10: 8,  # HCF/LCM (Default, check for Lesson 9)
    11: 10, # Geom
    12: 12, # Circles
    13: 12, # Circles
    14: 13, # Stats
    15: 13, # Stats
    16: 14  # Prob
}

def get_citation(q_idx, question_text):
    lesson = LESSON_MAP.get(q_idx + 1, 0)
    
    # Logic for Q10 (Lesson 8 vs 9)
    if q_idx + 1 == 10:
        # If text has exponent logic (power, root, solve x in exponent)
        # Keywords: indices, power, root, ^, sqrt
        text_lower = question_text.lower()
        if "^" in text_lower or "root" in text_lower or "simplify" in text_lower or "solve" in text_lower:
             # Actually Q9 is also Solve. Q10 is HCF/LCM OR Indices.
             # If "HCF" or "LCM" -> Lesson 8.
             if "hcf" in text_lower or "lcm" in text_lower or "m.s." in text_lower or "l.s." in text_lower:
                 lesson = 8
             else:
                 lesson = 9
    
    return f"Lesson {lesson}"

def fix_citations():
    print("Fixing missing citations...")
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        questions = data[1]["questions"]
        modified = False
        
        for i, q in enumerate(questions):
            if "sub_questions" in q:
                for sq in q["sub_questions"]:
                    expl_en = sq.get("explanationEnglish", "")
                    expl_ne = sq.get("explanationNepali", "")
                    
                    if "Citation" not in expl_en and "citation" not in expl_en:
                        # Determine Citation
                        # Use text from context + question to help determination (esp for Q10)
                        full_text = q.get("context", {}).get("English", "") + " " + sq.get("questionEnglish", "")
                        citation_text = get_citation(i, full_text)
                        
                        citation_str = f"Citation: {citation_text}"
                        citation_str_ne = f"उद्धरण: पाठ {citation_text.split()[-1]}" # "पाठ 14"
                        
                        # Append to ExplanationEnglish
                        if expl_en:
                            sq["explanationEnglish"] = f"{expl_en}\n{citation_str}"
                        else:
                            sq["explanationEnglish"] = f"Explanation: See textbook.\n{citation_str}"
                            
                        # Append to ExplanationNepali
                        if expl_ne:
                            sq["explanationNepali"] = f"{expl_ne}\n{citation_str_ne}"
                        else:
                            sq["explanationNepali"] = f"व्याख्या: पाठ्यपुस्तक हेर्नुहोस्।\n{citation_str_ne}"
                            
                        modified = True
                        print(f"  {filename} Q{i+1}: Added {citation_str}")

        if modified:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    fix_citations()
