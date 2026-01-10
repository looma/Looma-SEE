import os
import json

def audit_science_slashes(directory):
    found = False
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
                
                # Handle if questions is a dict (grouped) or list (flat)
                all_questions = []
                if isinstance(questions_data, dict):
                    for key, val in questions_data.items():
                        if isinstance(val, list):
                            all_questions.extend(val)
                        else:
                            # print(f"  Skipping non-list value for key '{key}': {type(val)}")
                            pass
                elif isinstance(questions_data, list):
                    all_questions = questions_data
                
                for i, q in enumerate(all_questions):
                    if not isinstance(q, dict):
                        # print(f"  Skipping non-dict question at index {i}: {type(q)}")
                        continue

                    # Check main question answers
                    if "sampleAnswerEnglish" in q and isinstance(q["sampleAnswerEnglish"], str) and "/" in q["sampleAnswerEnglish"]:
                        print(f"  FOUND [English] Q{q.get('questionNumberEnglish')}: {q['sampleAnswerEnglish']}")
                        found = True
                    if "sampleAnswerNepali" in q and isinstance(q["sampleAnswerNepali"], str) and "/" in q["sampleAnswerNepali"]:
                        print(f"  FOUND [Nepali] Q{q.get('questionNumberEnglish')}: {q['sampleAnswerNepali']}")
                        found = True
                    
                    # Check sub-questions if any
                    if "subQuestions" in q and isinstance(q["subQuestions"], list):
                        for sub_q in q["subQuestions"]:
                             if not isinstance(sub_q, dict): continue
                             
                             if "sampleAnswerEnglish" in sub_q and isinstance(sub_q["sampleAnswerEnglish"], str) and "/" in sub_q["sampleAnswerEnglish"]:
                                print(f"  FOUND [English] Q{q.get('questionNumberEnglish')}{sub_q.get('idEnglish')}: {sub_q['sampleAnswerEnglish']}")
                                found = True
                             if "sampleAnswerNepali" in sub_q and isinstance(sub_q["sampleAnswerNepali"], str) and "/" in sub_q["sampleAnswerNepali"]:
                                print(f"  FOUND [Nepali] Q{q.get('questionNumberEnglish')}{sub_q.get('idEnglish')}: {sub_q['sampleAnswerNepali']}")
                                found = True

            except Exception as e:
                print(f"Error processing {filename}: {e}")
                import traceback
                traceback.print_exc()
    
    if not found:
        print("No slash delimiters found in any Science exam answers.")

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    audit_science_slashes(directory)
