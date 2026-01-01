import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def fix_answers():
    print("Fixing missing answers...")
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        questions = data[1]["questions"]
        modified = False
        
        for q in questions:
            if "sub_questions" in q:
                for sq in q["sub_questions"]:
                    ans_en = sq.get("answerEnglish", "")
                    ans_ne = sq.get("answerNepali", "")
                    legacy_ans = sq.get("answer", "")
                    
                    # Logic: Ensure ans_en and ans_ne are populated
                    
                    # Case 1: Populating from Legacy 'answer'
                    if (not ans_en) and legacy_ans:
                        sq["answerEnglish"] = legacy_ans
                        ans_en = legacy_ans
                        modified = True
                        
                    if (not ans_ne) and legacy_ans:
                        sq["answerNepali"] = legacy_ans
                        ans_ne = legacy_ans
                        modified = True
                        
                    # Case 2: Cross-population
                    if ans_en and not ans_ne:
                        sq["answerNepali"] = ans_en
                        modified = True
                    elif ans_ne and not ans_en:
                        sq["answerEnglish"] = ans_ne
                        modified = True
                        
                    # Case 3: Still empty? Fallback.
                    if (not sq.get("answerEnglish")) and (not sq.get("answerNepali")):
                        sq["answerEnglish"] = "See explanation"
                        sq["answerNepali"] = "व्याख्या हेर्नुहोस्"
                        modified = True
                        
                    # Cleanup legacy 'answer' field to be clean?
                    if "answer" in sq:
                        del sq["answer"]
                        modified = True

        if modified:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  Fixed answers in {filename}")

if __name__ == "__main__":
    fix_answers()
