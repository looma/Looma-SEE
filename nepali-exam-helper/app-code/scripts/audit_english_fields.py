import json
import os
import re

# Files to process
files = [
    "see_2081_social_practice_1_generated.json",
    "see_2081_social_practice_2_generated.json",
    "see_2081_social_practice_3_generated.json",
    "see_2081_social_practice_4_generated.json",
    "see_2081_social_practice_5_generated.json"
]

# Directory
data_dir = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"

devanagari_pattern = re.compile(r'[\u0900-\u097F]+')

def check_recursive(data, path=""):
    issues = []
    if isinstance(data, list):
        for i, item in enumerate(data):
            issues.extend(check_recursive(item, f"{path}[{i}]"))
    elif isinstance(data, dict):
        for key, value in data.items():
            current_path = f"{path}.{key}" if path else key
            
            if key.endswith("English"):
                if isinstance(value, str):
                    if devanagari_pattern.search(value):
                        issues.append({
                            "path": current_path,
                            "value": value
                        })
                elif isinstance(value, list) or isinstance(value, dict):
                     issues.extend(check_recursive(value, current_path))
            else:
                # Recurse even if not English key, to find nested English keys
                if isinstance(value, (list, dict)):
                    issues.extend(check_recursive(value, current_path))
                    
    return issues

def audit_file(file_name):
    file_path = os.path.join(data_dir, file_name)
    print(f"Auditing {file_name}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {file_name}: {e}")
        return

    issues = check_recursive(data)
    
    if issues:
        print(f"Found {len(issues)} issues in {file_name}:")
        for issue in issues:
            print(f"  Path: {issue['path']}")
            safe_value = issue['value'].encode('ascii', 'backslashreplace').decode('ascii')
            print(f"  Value: {safe_value}")
    else:
        print(f"No issues found in {file_name}")

if __name__ == "__main__":
    for file_name in files:
        audit_file(file_name)
    print("Audit Complete.")
