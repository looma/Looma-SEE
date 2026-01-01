import json
import os

filepath = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_1.json"

with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

questions = []
for item in data:
    if "questions" in item:
        questions = item["questions"]
        break

print("Exam 1 Breakdown:")
for i, q in enumerate(questions):
    total = 0
    sub_count = 0
    if "sub_questions" in q:
        sub_count = len(q["sub_questions"])
        for sq in q["sub_questions"]:
             total += sq.get("marksEnglish", 0)
    print(f"Q{i+1}: {total} marks ({sub_count} subs)")
