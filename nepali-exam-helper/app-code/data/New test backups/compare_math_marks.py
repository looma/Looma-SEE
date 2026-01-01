import json
import os

files = [
    "see_2081_math_practice_1.json",
    "see_2081_math_practice_2.json",
    "see_2081_math_practice_3.json"
]
DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def get_breakdown(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = []
    # Find questions list (sometimes in index 1, check structure)
    for item in data:
        if "questions" in item:
            questions = item["questions"]
            break
            
    breakdown = []
    for q in questions:
        q_total = 0
        if "sub_questions" in q:
            for sq in q["sub_questions"]:
                q_total += sq.get("marksEnglish", 0)
        breakdown.append(q_total)
    return breakdown

breakdowns = {}
for f in files:
    breakdowns[f] = get_breakdown(f)

# Print Comparison
print(f"{'Q':<5} {'Exam 1 (Ref)':<15} {'Exam 2':<15} {'Exam 3':<15}")
print("-" * 50)

ref_breakdown = breakdowns["see_2081_math_practice_1.json"]
e2_breakdown = breakdowns["see_2081_math_practice_2.json"]
e3_breakdown = breakdowns["see_2081_math_practice_3.json"]

for i in range(len(ref_breakdown)):
    ref = ref_breakdown[i]
    e2 = e2_breakdown[i] if i < len(e2_breakdown) else 0
    e3 = e3_breakdown[i] if i < len(e3_breakdown) else 0
    
    diff2 = f"({e2 - ref})" if e2 != ref else ""
    diff3 = f"({e3 - ref})" if e3 != ref else ""
    
    print(f"Q{i+1:<4} {ref:<15} {str(e2) + diff2:<15} {str(e3) + diff3:<15}")

total1 = sum(ref_breakdown)
total2 = sum(e2_breakdown)
total3 = sum(e3_breakdown)
print("-" * 50)
print(f"TOT  {total1:<15} {total2:<15} {total3:<15}")
