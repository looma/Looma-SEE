import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def count_questions():
    counts = {}
    print(f"Checking files in {DATA_DIR}")
    for i in range(1, 6):
        filename = f"see_2081_math_practice_{i}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"{filename} NOT FOUND")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Structure is usually list of dicts. One dict has "questions" key.
            question_count = 0
            found = False
            if isinstance(data, list):
                for item in data:
                    if 'questions' in item:
                        question_count = len(item['questions'])
                        found = True
                        break
            elif isinstance(data, dict):
                if 'questions' in data:
                    question_count = len(data['questions'])
                    found = True
            
            if found:
                counts[filename] = question_count
                print(f"{filename}: {question_count}")
            else:
                print(f"{filename}: 'questions' key not found")
        except Exception as e:
            print(f"{filename}: Error {e}")
        
    return counts

if __name__ == "__main__":
    count_questions()
