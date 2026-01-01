import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def audit_textbook_references():
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    
    print("Auditing for 'textbook' references in explanationEnglish...")
    count_found = 0
    
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        questions = data[1]["questions"]
        print(f"\n--- {filename} ---")
        
        for i, q in enumerate(questions):
            if "sub_questions" in q:
                for sq in q["sub_questions"]:
                    expl = sq.get("explanationEnglish", "")
                    label = sq.get("labelEnglish", "?")
                    
                    # Case insensitive check for 'textbook'
                    if "textbook" in expl.lower():
                        count_found += 1
                        # Clean up newlines for display
                        display_expl = expl.replace('\n', ' | ')
                        # Truncate if too long
                        if len(display_expl) > 60:
                            display_expl = display_expl[:57] + "..."
                            
                        print(f"  Q{i+1}.{label}: {display_expl}")

    print(f"\nTotal questions referring to textbook: {count_found}")

if __name__ == "__main__":
    audit_textbook_references()
