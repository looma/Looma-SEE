import json
import os
import re

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
files = [os.path.join(directory, f"see_2081_math_practice_{i}.json") for i in range(1, 10)]

citation_pattern = re.compile(r"Citation:\s*Lesson\s*\d+")

print("Starting Content Audit...\n")

for file_path in files:
    fname = os.path.basename(file_path)
    if not os.path.exists(file_path):
        print(f"[{fname}] MISSING")
        continue
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        test_obj = data[0] if isinstance(data, list) and len(data) > 0 else {}
        questions = data[1]['questions'] if len(data) > 1 else []
        
        # 1. Check Q16a Sample Space
        q16 = next((q for q in questions if q.get('question_numberEnglish') == 16), None)
        if q16:
            sub_q_a = next((sq for sq in q16.get('sub_questions', []) if sq.get('labelEnglish') == 'a'), None)
            if sub_q_a:
                ans = sub_q_a.get('answerEnglish', '')
                if '{HHH' not in ans or 'TTT}' not in ans or len(ans.split(',')) < 8:
                     print(f"[{fname}] Q16a Answer NOT FULLY EXPANDED: {ans}")
            else:
                print(f"[{fname}] Q16a sub-question 'a' not found")
        else:
             print(f"[{fname}] Q16 not found")

        # 2. Check Citations
        citations_ok = True
        for q in questions:
            for sq in q.get('sub_questions', []):
                expl = sq.get('explanationEnglish', '')
                if 'Citation:' in expl:
                    if not citation_pattern.search(expl):
                        print(f"[{fname}] Invalid Citation Format: {expl}")
                        citations_ok = False
        
        # 3. Check for camelCase field `questionNumber`
        keys_str = json.dumps(data)
        if "questionNumber" in keys_str or "instructionsNepali" in keys_str:
             if "questionNumber" in keys_str:
                 print(f"[{fname}] Found 'questionNumber' (should likely be snake_case)")
             # instructionsNepali is fine if present, but we noted it might be absent.
             
    except Exception as e:
        print(f"[{fname}] JSON Error or Script Error: {e}")

print("\nAudit Complete.")
