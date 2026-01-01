import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def check_file(filename):
    print(f"\n--- Checking {filename} ---")
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print("File not found.")
        return

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data[1]["questions"]
    total_file_marks = 0
    
    error_count = 0
    
    for i, q in enumerate(questions):
        q_num = q.get("question_numberEnglish")
        if q_num != i + 1:
            print(f"  Error: Q index {i} has question_numberEnglish {q_num}. Expected {i+1}.")
            error_count += 1
            
        # Check Subquestions
        if "sub_questions" not in q:
            print(f"  Error: Q{q_num} has no sub_questions list.")
            error_count += 1
            continue
            
        subs = q["sub_questions"]
        q_marks = 0
        expected_labels = ['a', 'b', 'c', 'd', 'e']
        
        for j, sq in enumerate(subs):
            label = sq.get("labelEnglish", "?")
            
            # Check Label Sequence
            if j < len(expected_labels) and label != expected_labels[j]:
                 print(f"  Warning: Q{q_num} subquestion {j} has label '{label}'. Expected '{expected_labels[j]}'.")
            
            # Check Empty Fields
            required_fields = ["questionEnglish", "questionNepali", "marksEnglish", "answerEnglish"]
            for field in required_fields:
                val = sq.get(field)
                if val is None or str(val).strip() == "":
                    # Exception: answerEnglish might be missing if answerNepali exists? check expectation.
                    # Standard is both.
                    print(f"  Error: Q{q_num}.{label} missing field '{field}'.")
                    error_count += 1
            
            # Check for Placeholders
            for k, v in sq.items():
                if isinstance(v, str) and ("ORIGINAL" in v or "TODO" in v or "FIXME" in v):
                     print(f"  Error: Q{q_num}.{label} field '{k}' contains placeholder: '{v}'.")
                     error_count += 1

            # Sum Marks
            m = sq.get("marksEnglish", 0)
            q_marks += m
            
        total_file_marks += q_marks
        
        # Check Q marks vs Expectation (rough logic)
        # Exams 2,3,4,5 all normalized to ~75.
        
    print(f"  Total Marks Parsed: {total_file_marks}")
    if total_file_marks != 75:
        print(f"  Error: Total marks {total_file_marks} != 75.")
        error_count += 1
        
    if error_count == 0:
        print("  Status: CLEAN")
    else:
        print(f"  Status: {error_count} ISSUES FOUND")

def main():
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 6)]
    for f in files:
        check_file(f)

if __name__ == "__main__":
    main()
