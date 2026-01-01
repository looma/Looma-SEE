import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def audit_citations():
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    
    print("Auditing for missing Citations in explanationEnglish...")
    count_missing = 0
    
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        questions = data[1]["questions"]
        file_missing = 0
        
        print(f"\n--- {filename} ---")
        for i, q in enumerate(questions):
            if "sub_questions" in q:
                for sq in q["sub_questions"]:
                    expl = sq.get("explanationEnglish", "")
                    label = sq.get("labelEnglish", "?")
                    
                    if "Citation" not in expl and "citation" not in expl:
                        # Check if explanation is just completely empty?
                        if not expl:
                            print(f"  Q{i+1}.{label}: Missing explanationEnglish entirely.")
                        else:
                            print(f"  Q{i+1}.{label}: Explanation exists but no 'Citation' found.")
                        file_missing += 1
                        count_missing += 1
                        
        if file_missing == 0:
            print("  All Citations present.")
            
    print(f"\nTotal missing citations found: {count_missing}")

if __name__ == "__main__":
    audit_citations()
