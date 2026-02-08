import json
import os
import re

def is_ascii(s):
    return all(ord(c) < 128 for c in s)

def audit_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding {filepath}")
            return []

    file_issues = []

    def find_english_answers(data, path, res):
        if isinstance(data, dict):
            for k, v in data.items():
                if is_ascii(k):
                     res.append((path, k))
                find_english_answers(v, path + f".{k}", res)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                find_english_answers(item, path + f"[{i}]", res)

    def traverse_question(q, q_num_str, file_issues):
        for field in ['sampleAnswerNepali', 'correctAnswerNepali']:
            if field in q:
                value = q[field]
                sub_results = []
                find_english_answers(value, field, sub_results)
                for path, key in sub_results:
                    file_issues.append(f"Q{q_num_str}: {path} -> Key '{key}' is English")

        if 'subQuestions' in q:
            for i, sub_q in enumerate(q['subQuestions']):
                # Construct a readable subquestion ID
                sq_id = sub_q.get('idEnglish', sub_q.get('idNepali', f"sub{i+1}"))
                traverse_question(sub_q, f"{q_num_str}.{sq_id}", file_issues)

    # Root can be a list of objects. One usually contains "testId", another "questions".
    if isinstance(data, list):
        root = data
    else:
        root = [data]

    for item in root:
        if 'questions' in item:
            for q in item['questions']:
                q_num = q.get('questionNumberEnglish', q.get('questionNumberNepali', '?'))
                traverse_question(q, str(q_num), file_issues)
    
    return file_issues

files = [
    "see_2081_nepali_practice_1_generated.json",
    "see_2081_nepali_practice_2_generated.json",
    "see_2081_nepali_practice_3_generated.json",
    "see_2081_nepali_practice_4_generated.json",
    "see_2081_nepali_practice_5_generated.json"
]

dir_path = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"

with open("audit_results.txt", "w", encoding="utf-8") as f_out:
    for filename in files:
        path = os.path.join(dir_path, filename)
        if os.path.exists(path):
            issues = audit_file(path)
            if issues:
                f_out.write(f"--- {filename} ---\n")
                for issue in issues:
                    f_out.write(issue + "\n")
                f_out.write("\n")
print("Audit complete. Results written to audit_results.txt")
