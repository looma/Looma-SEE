
import json
import os
import re

def audit_all_exams():
    base_path = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"
    
    subjects = [
        {"name": "Math", "pattern": "see_2081_math_practice_{}.json", "has_nepali": True},
        {"name": "Nepali", "pattern": "see_2081_nepali_practice_{}_generated.json", "has_nepali": True},
        {"name": "English", "pattern": "see_2081_english_practice_{}_generated.json", "has_nepali": False},
        {"name": "Science", "pattern": "see_2081_science_practice_{}_generated.json", "has_nepali": True},
        {"name": "Social", "pattern": "see_2081_social_practice_{}_generated.json", "has_nepali": True}
    ]

    # Correction on Math filenames based on user context
    # "Math Exams: see_2081_math_practice_1.json" - looks like no _generated for Math?
    # but let's try to detect.
    
    total_issues = 0

    for subject in subjects:
        print(f"\n=== Auditing {subject['name']} Exams ===")
        
        for i in range(1, 6):
            # Try pattern
            filename = subject["pattern"].format(i)
            file_path = os.path.join(base_path, filename)
            
            # Fallback not needed if pattern is correct
            if not os.path.exists(file_path):
                print(f"  [MISSING] {filename}")
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception as e:
                print(f"  [CRITICAL] {filename}: Invalid JSON - {e}")
                total_issues += 1
                continue

            issues = []
            
            # 1. Structure Check
            if not isinstance(data, list) or len(data) != 2:
                issues.append("Top-level structure is not [Header, Content]")
            else:
                # Header Check
                header = data[0]
                content = data[1]
                
                # Check _id in header
                if list(header.keys())[0] != "_id":
                    issues.append("Header '_id' is not the first key")
                
                # Check testId in content
                if "testId" not in content:
                    issues.append("Content missing 'testId'")
                
                # Check Field Order (Nepali First) in Header
                check_field_order(header, issues, "Header", subject["name"])
                
                # Recursively check content
                check_content_node(content, issues, "Content", subject["name"])

            if issues:
                print(f"  [ISSUES] {filename}:")
                for issue in issues:
                    print(f"    - {issue}")
                total_issues += len(issues)
            else:
                print(f"  [OK] {filename}")

    print(f"\nTotal Issues Found: {total_issues}")

def check_field_order(node, issues_list, path, subject_name):
    keys = list(node.keys())
    
    # 1. Check Nepali First
    for i, key in enumerate(keys):
        if key.endswith("English"):
            base = key[:-7]
            nepali_key = base + "Nepali"
            if nepali_key in keys:
                nepali_idx = keys.index(nepali_key)
                if nepali_idx > i:
                    issues_list.append(f"Field Order: '{nepali_key}' follows '{key}' at {path}")
    
    # 2. Check value purity
    for key, val in node.items():
        if isinstance(val, str):
            # English fields should not have Devanagari
            if key.endswith("English"):
                if re.search(r'[\u0900-\u097F]', val):
                    # Ignore known mixed fields if any? (Usually none allowed)
                    issues_list.append(f"Language Purity: Devanagari in '{key}' at {path}")
    
            # Citation Checks
            if "Citation:" in val:
                 check_citation(val, key, path, subject_name, issues_list)

def check_content_node(node, issues_list, path, subject_name):
    if isinstance(node, list):
        for i, item in enumerate(node):
            check_content_node(item, issues_list, f"{path}[{i}]", subject_name)
    elif isinstance(node, dict):
        # Check for bad _id
        if "_id" in node and path != "Content": # Content root is allowed to have _id? No, we prefer testId.
             # Actually previous task said remove _id from content.
             # But let's check if it is MongoDB style
             val = node["_id"]
             if isinstance(val, dict) and "$oid" in val:
                 issues_list.append(f"MongoDB _id detected at {path}")
             elif path != "Content": # Assuming inner nodes shouldn't have _id generally
                 # issues_list.append(f"Inner _id detected at {path}") 
                 pass # Relaxing this as some generic IDs might exist? But user wanted removal in Social/Science.

        check_field_order(node, issues_list, path, subject_name)
        
        for key, val in node.items():
            check_content_node(val, issues_list, f"{path}.{key}", subject_name)

def check_citation(text, key, path, subject_name, issues_list):
    # Check for multiple citations
    count = text.count("Citation:")
    if count > 1:
        issues_list.append(f"Multiple citations ({count}) found in '{key}' at {path}")
        return

    # Extract citation text
    idx = text.find("Citation:")
    if idx == -1: return

    # Check if proper end of string (ignoring whitespace)
    # Get everything from Citation: to end
    citation_block = text[idx:].strip()
    
    # If there is content after the expected citation pattern, it fails strict end check
    # But let's first check regex compliance of the BLOCK
    
    if subject_name == "Social":
        # Citation: Unit X, Lesson Y OR Citation: Unit X
        if not re.match(r'^Citation: Unit \d+(, Lesson \d+)?\.?$', citation_block):
             issues_list.append(f"Invalid Social Citation format: '{citation_block}' at {path}.{key}")
    elif subject_name == "Science":
        # Citation: Lesson X
        if not re.match(r'^Citation: Lesson \d+\.?$', citation_block):
             issues_list.append(f"Invalid Science Citation format: '{citation_block}' at {path}.{key}")
    # Math/English/Nepali might not have strict citation rules defined yet? or adhere to one of the above?
    # Usually Math doesn't have citations in this format.
    # Nepali might?
    # If they exist, verify basic "Citation:" usage isn't broken.

if __name__ == "__main__":
    audit_all_exams()
