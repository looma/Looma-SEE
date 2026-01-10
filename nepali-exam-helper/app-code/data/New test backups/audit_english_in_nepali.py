import os
import json
import re
import sys

def audit_english_in_nepali(directory):
    sys.stdout.reconfigure(encoding='utf-8')
    found_count = 0
    # Pattern to match: (English Text)
    # Exclude common patterns that might be valid like (i), (ii), numbers, scientific formulas
    # \([A-Za-z\s]+\) looks for parentheses containing only letters and spaces.
    pattern = re.compile(r'\([A-Za-z\s]+\)')
    
    for filename in os.listdir(directory):
        if filename.startswith("see_2081_science_practice_") and filename.endswith(".json"):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                print(f"Scanning {filename}...")
                
                # Handle if data is a list (find the object with "questions")
                questions_data = {}
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "questions" in item:
                            questions_data = item["questions"]
                            break
                elif isinstance(data, dict):
                    questions_data = data.get("questions", {})
                
                # Flatten questions list
                all_questions = []
                if isinstance(questions_data, dict):
                    for key, val in questions_data.items():
                        if isinstance(val, list):
                            all_questions.extend(val)
                elif isinstance(questions_data, list):
                    all_questions = questions_data
                
                for q in all_questions:
                    if not isinstance(q, dict): continue
                    
                    q_num = q.get('questionNumberEnglish', 'Unknown')
                    
                    # Check main question Nepali answer
                    if "sampleAnswerNepali" in q and isinstance(q["sampleAnswerNepali"], str):
                        matches = pattern.findall(q["sampleAnswerNepali"])
                        if matches:
                            print(f"  FOUND Q{q_num}: {q['sampleAnswerNepali']}")
                            print(f"    Matches: {matches}")
                            found_count += 1
                    
                    # Check sub-questions if any
                    if "subQuestions" in q and isinstance(q["subQuestions"], list):
                        for sub_q in q["subQuestions"]:
                             if not isinstance(sub_q, dict): continue
                             
                             if "sampleAnswerNepali" in sub_q and isinstance(sub_q["sampleAnswerNepali"], str):
                                matches = pattern.findall(sub_q["sampleAnswerNepali"])
                                if matches:
                                    sub_id = sub_q.get('idEnglish', '')
                                    print(f"  FOUND Q{q_num}{sub_id}: {sub_q['sampleAnswerNepali']}")
                                    print(f"    Matches: {matches}")
                                    found_count += 1

            except Exception as e:
                print(f"Error processing {filename}: {e}")
                
    if found_count == 0:
        print("No English text in parentheses found in Nepali answers.")
    else:
        print(f"\nTotal instances found: {found_count}")

if __name__ == "__main__":
    directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    audit_english_in_nepali(directory)
