
import json
import os
import re

def verify_science_citations():
    base_path = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"
    files = [f"see_2081_science_practice_{i}_generated.json" for i in range(1, 5)]

    all_passed = True

    for filename in files:
        file_path = os.path.join(base_path, filename)
        if not os.path.exists(file_path):
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        issues = []
        
        def check_node(node, path="root"):
            if isinstance(node, list):
                for i, item in enumerate(node):
                    check_node(item, f"{path}[{i}]")
            elif isinstance(node, dict):
                if "sampleAnswerEnglish" in node:
                    text = node["sampleAnswerEnglish"]
                    # Check multiple citations
                    count = text.count("Citation:")
                    if count > 1:
                        issues.append(f"Multiple citations ({count}) at {path}")
                    
                    # Check if ends with citation (ignoring whitespace)
                    if count == 1:
                        # Find last occurrence
                        idx = text.rfind("Citation:")
                        substring = text[idx:]
                        # Should match Citation: Lesson X (and maybe punctuation)
                        # We just want to check there's no substantial text AFTER it.
                        # Split by newline, check if citation is on the last non-empty line?
                        lines = text.strip().split('\n')
                        last_line = lines[-1].strip()
                        if not last_line.startswith("Citation:"):
                            issues.append(f"Citation not at end at {path}: ends with '{last_line}'")
                            
                for key, val in node.items():
                    check_node(val, f"{path}.{key}")

        if len(data) > 1:
             check_node(data[1])
        
        if issues:
            all_passed = False
            print(f"ISSUES in {filename}:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print(f"OK: {filename}")

    if all_passed:
        print("All Science exams verified successfully.")

if __name__ == "__main__":
    verify_science_citations()
