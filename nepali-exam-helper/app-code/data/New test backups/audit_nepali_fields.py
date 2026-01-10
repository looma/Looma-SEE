import os
import json
import sys

def audit_nepali_fields(directory):
    sys.stdout.reconfigure(encoding='utf-8')
    
    target_fields = [
        'correctAnswer', 'correctAnswerNepali', 'correctAnswerEnglish',
        'explanation', 'explanationEnglish', 'explanationNepali',
        'answer', 'answerEnglish', 'answerNepali',
        'sampleAnswer', 'sampleAnswerEnglish', 'sampleAnswerNepali'
    ]

    for i in range(1, 6):
        filename = f"see_2081_nepali_practice_{i}_generated.json"
        filepath = os.path.join(directory, filename)
        
        if not os.path.exists(filepath):
            print(f"File not found: {filename}")
            continue
            
        print(f"\n--- Analyizing {filename} ---")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            questions_found = 0
            
            def check_question(q):
                nonlocal questions_found
                
                # Try to find some identifier
                q_id = q.get('id', q.get('idNepali', q.get('questionNumber', 'NoID')))
                if q_id == 'NoID':
                     # Try to use title or question text partial
                     title = q.get('titleEnglish', q.get('questionEnglish', 'Unknown'))
                     q_id = f"NoID_({title[:20]}...)"

                q_type = q.get('type', 'Unknown Type')
                
                # Identify present fields
                present = [field for field in target_fields if field in q]
                
                missing = []
                
                # Heuristics
                if q_type == 'multiple_choice':
                    if 'correctAnswer' not in present and 'correctAnswerEnglish' not in present:
                        missing.append('correctAnswer')
                elif q_type == 'matching':
                     if 'correctAnswerNepali' not in present and 'correctAnswerEnglish' not in present:
                          missing.append('correctAnswer')
                elif q_type in ['long_answer', 'short_answer', 'very_short_answer']:
                    # Usually need sampleAnswerNepali for subjectivity
                    if 'sampleAnswerNepali' not in present and 'answerNepali' not in present:
                         missing.append('sampleAnswer/answer')

                print(f"Q: {q_id} ({q_type})")
                print(f"  Fields: {', '.join(present)}")
                if missing:
                    print(f"  MISSING POTENTIAL KEY FIELD: {missing}")
                
                questions_found += 1
                
                # Recursive subquestions
                sub_qs = q.get('sub_questions', q.get('subQuestions', q.get('choices', [])))
                if sub_qs:
                    for sq in sub_qs:
                        check_question(sq)

            def traverse(obj):
                if isinstance(obj, dict):
                    # Robust check for question node
                    # It matches if it has 'type' OR 'questionNumber' OR ('id' AND 'questionNepali')
                    is_question = False
                    if 'type' in obj and isinstance(obj['type'], str):
                         is_question = True
                    elif 'questionNumber' in obj:
                         is_question = True
                    elif 'questionNepali' in obj:
                         is_question = True
                    
                    if is_question:
                        check_question(obj)
                    else:
                        for k, v in obj.items():
                            traverse(v)
                elif isinstance(obj, list):
                    for item in obj:
                        traverse(item)

            traverse(data)
            print(f"Total Questions Scanned: {questions_found}")

        except Exception as e:
            print(f"Error reading {filename}: {e}")

if __name__ == "__main__":
    directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    audit_nepali_fields(directory)
