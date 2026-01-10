
import os
import json

def scan_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    filename = os.path.basename(filepath)
    
    # We expect a structure like [{"testId": ...}, {"questions": [...]}] or just {"questions": [...]}
    questions = []
    if isinstance(data, list):
        for item in data:
            if "questions" in item:
                questions = item["questions"]
                break
            # Also check for groups structure
            if "groups" in item:
                for group in item["groups"]:
                    if "questions" in group:
                        questions.extend(group["questions"])
    elif isinstance(data, dict):
        if "questions" in data:
            questions = data["questions"]
        elif "groups" in data:
             for group in data["groups"]:
                if "questions" in group:
                    questions.extend(group["questions"])

    if not questions:
        # Fallback recursive search for "questions" list
        def find_questions(obj):
            found = []
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k == "questions" and isinstance(v, list):
                        found.extend(v)
                    else:
                        found.extend(find_questions(v))
            elif isinstance(obj, list):
                for item in obj:
                    found.extend(find_questions(item))
            return found
        
        questions = find_questions(data)

    target_keys = [
        "answer", "answerNepali", "answerEnglish",
        "correctAnswer", "correctAnswerNepali", "correctAnswerEnglish",
        "explanation", "explanationNepali", "explanationEnglish",
        "modelAnswer", "sampleAnswer", "sampleAnswerNepali", "sampleAnswerEnglish"
    ]

    for q_idx, q in enumerate(questions):
        if not isinstance(q, dict):
            continue
        # determine question number for reporting
        q_num = q.get("questionNumberEnglish", q.get("questionNumberNepali", str(q_idx + 1)))

        def check_value(val, path):
            if isinstance(val, str):
                if "**" in val:
                    print(f"[{filename}] -> Question {q_num}: {path}")
            elif isinstance(val, list):
                for i, item in enumerate(val):
                    check_value(item, f"{path}[{i}]")
            elif isinstance(val, dict):
                for k, v in val.items():
                    check_value(v, f"{path}.{k}")

        for key in target_keys:
            if key in q:
                check_value(q[key], key)
        
        # Check inside subQuestions if they exist
        if "subQuestions" in q:
            for sub_q in q["subQuestions"]:
                 sub_q_id = sub_q.get("idEnglish", sub_q.get("idNepali", "?"))
                 for key in target_keys:
                    if key in sub_q:
                        check_value(sub_q[key], f"subQuestion({sub_q_id}).{key}")
        
        # Check inside subSections if they exist (literature questions)
        if "subSections" in q:
             for sub_sec in q["subSections"]:
                 sub_sec_id = sub_sec.get("idEnglish", sub_sec.get("idNepali", "?"))
                 if "subQuestions" in sub_sec:
                     for sub_q in sub_sec["subQuestions"]:
                         sub_q_id = sub_q.get("idEnglish", sub_q.get("idNepali", "?"))
                         for key in target_keys:
                            if key in sub_q:
                                check_value(sub_q[key], f"subSection({sub_sec_id}).subQuestion({sub_q_id}).{key}")


folder = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
files = [f for f in os.listdir(folder) if f.endswith(".json")]

for f in files:
    scan_file(os.path.join(folder, f))
