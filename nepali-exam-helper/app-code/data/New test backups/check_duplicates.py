
import json
import os
import re
from collections import defaultdict

# Directory to scan
DIRECTORY = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def get_questions_from_file(filepath):
    questions = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'questions' in data:
            for idx, q in enumerate(data['questions']):
                # Some files might have different structures, try to be robust
                if not isinstance(q, dict): 
                    continue
                
                # Extract identifiers for reporting
                q_num = q.get('questionNumberEnglish', str(idx + 1))
                
                # Extract text for comparison
                # We'll use a tuple of (questionEnglish, questionNepali) as the unique signature
                # We strip whitespace and ignore casing for better matching
                q_eng = q.get('questionEnglish', '').strip()
                q_nep = q.get('questionNepali', '').strip()
                
                # also check for context/stem if it exists, as some questions share a stem
                # but validly different subquestions? 
                # Actually, usually duplicates mean the whole item is copied.
                # Let's stick to the main question text. If it's empty, maybe it's a context-based one.
                
                if not q_eng and not q_nep:
                    # Try looking for context
                    q_eng = q.get('contextEnglish', '').strip()
                    q_nep = q.get('contextNepali', '').strip()

                if not q_eng and not q_nep:
                    pass # Empty question?
                    
                questions.append({
                    'file': os.path.basename(filepath),
                    'number': q_num,
                    'english': q_eng,
                    'nepali': q_nep,
                    'raw_q': q # Keep for potential deeper inspection if needed
                })
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return questions

def normalize_text(text):
    """Normalize text for comparison (remove whitespace, lowercase)."""
    if not text: return ""
    return re.sub(r'\s+', ' ', text).strip().lower()

def check_duplicates_for_subject(subject, files):
    print(f"\n--- Checking {subject.upper()} ({len(files)} files) ---")
    
    # Map of "signature" -> list of occurrences
    # Signature can be just English, or English+Nepali. 
    # Let's use English if available, else Nepali. 
    # If both, checking both is stricter. Let's check both individually first? 
    # No, combined is best to avoid false positives if one is empty.
    
    seen_map = defaultdict(list)
    
    for filepath in files:
        qs = get_questions_from_file(filepath)
        for q in qs:
            eng_norm = normalize_text(q['english'])
            nep_norm = normalize_text(q['nepali'])
            
            # Skip empty placeholders
            if not eng_norm and not nep_norm:
                continue
                
            # If a question has "See the map" or generic text, it might trigger false positives.
            # But we want to know about those too.
            
            signature = (eng_norm, nep_norm)
            seen_map[signature].append(q)
            
    # Report duplicates
    dup_count = 0
    for sig, occurrences in seen_map.items():
        if len(occurrences) > 1:
            # We have a duplicate
            # Check if they are from different files (cross-file duplicate) 
            # or same file (intra-file duplicate)
            
            files_involved = set(o['file'] for o in occurrences)
            
            # We care about ALL duplicates, but especially cross-file
            print(f"\nPotential Duplicate Found ({len(occurrences)} instances):")
            print(f"  Text (Eng): {occurrences[0]['english'][:100]}...")
            print(f"  Text (Nep): {occurrences[0]['nepali'][:100]}...")
            for occ in occurrences:
                print(f"    - {occ['file']} (Q {occ['number']})")
            dup_count += 1

    if dup_count == 0:
        print("No duplicates found.")

def main():
    # 1. Group files by subject
    files_by_subject = defaultdict(list)
    
    for filename in os.listdir(DIRECTORY):
        if not filename.endswith(".json"): continue
        
        # Parse subject from filename: see_2081_<subject>_practice_<num>...
        match = re.match(r"see_2081_([a-z]+)_practice_", filename)
        if match:
            subject = match.group(1)
            filepath = os.path.join(DIRECTORY, filename)
            files_by_subject[subject].append(filepath)
            
    # 2. Check each subject
    for subject, files in files_by_subject.items():
        check_duplicates_for_subject(subject, files)

if __name__ == "__main__":
    main()
