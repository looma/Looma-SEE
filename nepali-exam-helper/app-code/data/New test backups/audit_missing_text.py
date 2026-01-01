import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def audit_missing_text():
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    
    print("Auditing for missing Question Text...")
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        questions = data[1]["questions"]
        found_issue = False
        
        for i, q in enumerate(questions):
            if "sub_questions" in q:
                for sq in q["sub_questions"]:
                    qn = sq.get("questionNepali", "")
                    qe = sq.get("questionEnglish", "")
                    
                    if not qn or not qe or qn.strip() == "" or qe.strip() == "":
                        if not found_issue:
                            print(f"\n--- {filename} ---")
                            found_issue = True
                        label = sq.get("labelEnglish", "?")
                        print(f"  Q{i+1}.{label} has missing text.")
                        print(f"    Nepali: '{qn}'")
                        print(f"    English: '{qe}'")

if __name__ == "__main__":
    audit_missing_text()
