import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def analyze_exams():
    print(f"{'File':<35} | {'Questions':<10} | {'Subquestions':<12} | {'Total Marks':<11}")
    print("-" * 75)
    
    for i in range(1, 6):
        filename = f"see_2081_math_practice_{i}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"{filename:<35} | NOT FOUND")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            questions = []
            if isinstance(data, list):
                for item in data:
                    if 'questions' in item:
                        questions = item['questions']
                        break
            elif isinstance(data, dict):
                if 'questions' in data:
                    questions = data['questions']
            
            question_count = len(questions)
            subquestion_count = 0
            total_marks = 0
            
            for q in questions:
                # Check for subquestions
                subs = q.get('sub_questions', [])
                subquestion_count += len(subs)
                
                # Calculate marks
                # If subquestions exist, sum their marks
                if subs:
                    for sub in subs:
                        # Try marksEnglish first, then marksNepali (convert to float/int)
                        m = sub.get('marksEnglish', 0)
                        if not m:
                           try:
                               m = float(sub.get('marksNepali', 0))
                           except:
                               pass
                        total_marks += m
                else:
                    # If no subquestions, look for marks on the question itself
                    m = q.get('marksEnglish', 0)
                    if not m:
                        try:
                           m = float(q.get('marksNepali', 0))
                        except:
                           pass
                    total_marks += m
            
            print(f"{filename:<35} | {question_count:<10} | {subquestion_count:<12} | {total_marks:<11}")
            
        except Exception as e:
            print(f"{filename:<35} | Error: {e}")

if __name__ == "__main__":
    analyze_exams()
