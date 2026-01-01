import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

GENERIC_CONTEXT_EN = "Solve the following problem."
GENERIC_CONTEXT_NE = "तलका समस्याहरू हल गर्नुहोस् ।"

def fix_missing_text():
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            continue
            
        print(f"Fixing {filename}...")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        questions = data[1]["questions"]
        modified = False
        
        for q in questions:
            context_en = q.get("context", {}).get("English", "")
            context_ne = q.get("context", {}).get("Nepali", "")
            
            # Pattern 1: Missing text in Part (a) (Common in Exam 1-4 for unscaffolded Qs)
            if "sub_questions" in q and len(q["sub_questions"]) >= 1:
                qa = q["sub_questions"][0]
                qa_en = qa.get("questionEnglish", "")
                
                if not qa_en or qa_en.strip() == "":
                    # Move Context -> QA
                    qa["questionEnglish"] = context_en
                    qa["questionNepali"] = context_ne
                    # Genericize Context
                    q["context"]["English"] = GENERIC_CONTEXT_EN
                    q["context"]["Nepali"] = GENERIC_CONTEXT_NE
                    modified = True
                    # Don't genericize again if we hit part b logic below?
                    # Ideally Context should be generic if it was moved.
            
            # Pattern 2: Missing text in Part (b) (Specific to Exam 5 split)
            if "sub_questions" in q and len(q["sub_questions"]) >= 2:
                qb = q["sub_questions"][1]
                qb_en = qb.get("questionEnglish", "")
                
                if not qb_en or qb_en.strip() == "":
                    # Move Context (or what's left of it) -> QB
                    # Note: If we already genericized context above, we should have probably used the original context.
                    # But pattern 1 and 2 shouldn't happen in same Q normally (unless A and B are both empty?)
                    # In Exam 5, A has "Write formula", B is empty. So Pattern 1 won't trigger.
                    
                    if q["context"]["English"] == GENERIC_CONTEXT_EN:
                        # Already genericized? unlikely for Exam 5 scenario.
                        pass
                    else:
                        qb["questionEnglish"] = context_en
                        qb["questionNepali"] = context_ne
                        q["context"]["English"] = GENERIC_CONTEXT_EN
                        q["context"]["Nepali"] = GENERIC_CONTEXT_NE
                        modified = True

        if modified:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  Saved changes to {filename}")
        else:
            print("  No changes needed.")

if __name__ == "__main__":
    fix_missing_text()
