import json
import os
import hashlib
from collections import defaultdict

data_dir = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"
files = [f"see_2081_nepali_practice_{i}_generated.json" for i in range(1, 6)]

issues = []
question_hashes = defaultdict(list)

def get_hash(obj):
    content = ""
    # We want to identify duplicates based on the 'question' content.
    # Common headers like "Answer the following" might appear many times, we might want to ignore them if they are just headers.
    # But strictly speaking they are duplicates.
    # Let's gather specific fields that define the "unique content" of a question.
    relevant_fields = ['questionNepali', 'questionEnglish', 'passageNepali', 'passageEnglish', 'quoteNepali']
    
    found_content = False
    for field in relevant_fields:
        if field in obj and isinstance(obj[field], str) and obj[field].strip():
            content += obj[field].strip()
            found_content = True
            
    # If no specific question text, maybe it's a container with just a title (e.g. section header). 
    # We can skip strictly header-only objects from being flagged as "duplicate questions".
    # But if it has a title and NO subquestions, maybe it's relevant?
    # Let's just hash what we have. If it's a long passage it will be unique.
    
    return hashlib.md5(content.encode('utf-8')).hexdigest() if found_content else None

def check_obj(obj, file_name, path=""):
    if isinstance(obj, dict):
        if 'type' in obj: # It's a question or section
            h = get_hash(obj)
            if h:
                question_hashes[h].append((file_name, path, obj.get('questionEnglish') or obj.get('titleEnglish') or "Unknown"))

        for k, v in obj.items():
            current_path = f"{path}.{k}" if path else k
            
            if isinstance(v, str):
                # Issues Check
                if "### " in v and "sampleAnswer" in k:
                    issues.append(f"[{file_name}] {current_path}: Contains '### ' markdown header")
                
                if "Citation: Lesson" in v or "Citation: lesson" in v:
                     issues.append(f"[{file_name}] {current_path}: Usage of 'Citation: Lesson'")

                if "Citation:" in v:
                    lines = v.split('\n')
                    for line in lines:
                         # Normalize check
                        if "Citation:" in line:
                            if line.strip().endswith("."):
                                issues.append(f"[{file_name}] {current_path}: Citation ends with period: '{line.strip()}'")

            elif isinstance(v, (dict, list)):
                check_obj(v, file_name, current_path)

    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            check_obj(item, file_name, f"{path}[{i}]")

for fname in files:
    fpath = os.path.join(data_dir, fname)
    if not os.path.exists(fpath):
        issues.append(f"[{fname}] FILE NOT FOUND")
        continue
    
    try:
        with open(fpath, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
            check_obj(data, fname)
    except Exception as e:
        issues.append(f"[{fname}] Error reading/parsing: {e}")

print("--- ISSUES FOUND ---")
if not issues:
    print("No issues found.")
else:
    for i in issues:
        print(i)

print("\n--- DUPLICATE QUESTIONS (Content Matches) ---")
duplicates_found = False
for h, locations in question_hashes.items():
    if len(locations) > 1:
        # Check if unique files > 1 to prioritize cross-file duplicates?
        # Or just report all.
        files_involved = set(loc[0] for loc in locations)
        
        # We only care if the snippet text is substantial or appears across files
        # Let's print the first 50 chars of the content to help identify
        sample_text = locations[0][2][:50]
        
        print(f"Match [{sample_text}...] found in {len(locations)} locations:")
        for loc in locations:
            print(f"  - {loc[0]} :: {loc[1]}")
        duplicates_found = True

if not duplicates_found:
    print("No duplicates found.")
