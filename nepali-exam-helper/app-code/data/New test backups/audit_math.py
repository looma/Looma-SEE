
import json
import os
import re

def audit_file(filepath):
    issues = []
    filename = os.path.basename(filepath)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f"Could not read file: {e}"]

    # 1. Check for invalid JSON escapes using regex before parsing
    # JSON strings allow: \" \\ \/ \b \f \n \r \t \uXXXX
    # We want to find backslashes that are NOT followed by these.
    # Pattern: \ (but not \\) followed by something not in ["\/bfnrtu]
    # This is tricky with regex because of lookbehinds/escapes.
    # simpler: find all indices of '\', check next char.
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        idx = 0
        while idx < len(line):
            if line[idx] == '\\':
                # Check for end of line
                if idx + 1 >= len(line):
                    # Trailing backslash is invalid in JSON strings usually
                     idx += 1
                     continue

                char = line[idx+1]
                if char in ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']:
                    # Valid escape
                    if char == 'u':
                        # Should check for 4 hex digits technically, but let's just skip
                        idx += 6 
                    else:
                        idx += 2 # Skip the backslash and the escaped char
                else:
                    # Invalid escape found
                    issues.append(f"Line {i+1}: Potential invalid JSON escape or unescaped LaTeX: '\\{char}'")
                    idx += 1 # Move past backslash to avoid infinite loop
            else:
                idx += 1
    
    # 2. Try to parse JSON
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        issues.append(f"JSON Parse Error: {e}")
        return issues

    # Handle List Root
    if isinstance(data, list):
        if len(data) == 0:
            issues.append("Root is empty list")
            return issues
        
        # Merge all dicts in the list into one for validation
        merged_data = {}
        for item in data:
            if isinstance(item, dict):
                merged_data.update(item)
        
        # Check if we have multiple items and report it as a potential consistency issue (optional)
        if len(data) > 1:
            issues.append(f"Note: Root list has {len(data)} items (Split structure detected)")
            
        data = merged_data
    
    # 3. Check Header
    # Adjusted for the keys seen in the file
    required_header_fields = [
        "titleNepali", "titleEnglish", 
        "subjectNepali", "subjectEnglish",
        "totalMarksNepali", "totalMarksEnglish",
        "durationNepali", "durationEnglish",
        "instructionsNepali", "instructionsEnglish"
    ]
    
    # Check top level fields exist
    for field in required_header_fields:
        if field not in data:
            issues.append(f"Missing header field: {field}")
            
    # Check "questions"
    if "questions" not in data:
        issues.append("Missing 'questions' array")
        return issues
        
    questions = data.get("questions", [])
    if not isinstance(questions, list):
        issues.append("'questions' is not a list")
        return issues

    for q_idx, q in enumerate(questions):
        qid = q.get("id", f"index_{q_idx}")
        q_num = q.get("question_numberEnglish", qid)
        
        # Check basic fields for GROUP (context) questions
        # Math questions usually have 'context' and 'sub_questions'
        if "sub_questions" in q:
            # It's a group
            if "context" not in q:
                issues.append(f"Question {q_num}: Group missing 'context'")
            
            sub_qs = q.get("sub_questions", [])
            for sq_idx, sq in enumerate(sub_qs):
                label = sq.get("labelEnglish", f"{sq_idx}")
                for field in ["questionNepali", "questionEnglish", "answerNepali", "answerEnglish"]:
                     if field not in sq:
                         issues.append(f"Question {q_num}.{label}: Missing field '{field}'")
                     elif not sq[field]:
                         # Allow empty if strictly optional, but usually not
                         issues.append(f"Question {q_num}.{label}: Empty field '{field}'")
        else:
             # Standard Single Question
             for field in ["questionNepali", "questionEnglish", "answerNepali", "answerEnglish"]:
                if field not in q:
                    issues.append(f"Question {q_num}: Missing field '{field}'")
                elif not q[field]:
                    issues.append(f"Question {q_num}: Empty field '{field}'")

        
    return issues

def main():
    base_dir = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 10)]
    
    total_issues = 0
    
    print(f"Auditing 9 Math Exams in {base_dir}...\n")
    
    for filename in files:
        filepath = os.path.join(base_dir, filename)
        if not os.path.exists(filepath):
            print(f"[{filename}] FILE NOT FOUND")
            continue
            
        issues = audit_file(filepath)
        
        if issues:
            print(f"[{filename}] Found {len(issues)} issues:")
            for issue in issues[:10]: # Limit output per file
                print(f"  - {issue}")
            if len(issues) > 10:
                print(f"  ... and {len(issues)-10} more")
            total_issues += len(issues)
        else:
            print(f"[{filename}] OK")
            
    print(f"\nTotal issues found: {total_issues}")

if __name__ == "__main__":
    main()
