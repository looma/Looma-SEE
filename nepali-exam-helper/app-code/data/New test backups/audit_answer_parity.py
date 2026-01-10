import os
import json
import re

DATA_DIR = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def get_science_files():
    files = []
    for f in os.listdir(DATA_DIR):
        if f.startswith("see_2081_science") and f.endswith(".json"):
            files.append(os.path.join(DATA_DIR, f))
    return files

def count_bullets(text):
    if not text: return 0
    # Count occurrences of bullet-like markers
    # bullets: •, *, 1., 2., -, (i), (ii)
    # Simple regex for finding list items at start of lines
    lines = text.split('\n')
    count = 0
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.startswith('•') or line.startswith('*') or line.startswith('-'):
            count += 1
        elif re.match(r'^\d+\.', line) or re.match(r'^\([ivx]+\)', line.lower()):
            count += 1
    return count

def check_parity(data, filename, parent_id="Unknown"):
    issues = []
    
    if isinstance(data, dict):
        current_id = data.get("idEnglish") or data.get("idNepali") or parent_id
        
        # Check if this node has answers
        ans_eng = data.get("sampleAnswerEnglish")
        ans_nep = data.get("sampleAnswerNepali")
        
        if ans_eng is not None and ans_nep is not None:
            # Normalize
            eng_str = str(ans_eng).strip()
            nep_str = str(ans_nep).strip()
            
            # Check 1: Empty vs Non-empty
            if eng_str and not nep_str:
                issues.append(f"Q{current_id}: English answer exists but Nepali is empty.")
            elif nep_str and not eng_str:
                issues.append(f"Q{current_id}: Nepali answer exists but English is empty.")
            
            # Check 2: Bullet count mismatch
            b_eng = count_bullets(eng_str)
            b_nep = count_bullets(nep_str)
            
            if b_nep > 0 and b_eng < b_nep:
                issues.append(f"Q{current_id}: Nepali has more bullets ({b_nep}) than English ({b_eng}). Potential missing content.")
            
            # Check 3: Length disparity (heuristic)
            # Nepali chars vs English chars.
            # If English is significantly shorter (e.g. < 50% length), flag it.
            # Note: 1 Nepali char might be visually one letter but codepoints vary.
            # Assuming rough correlation.
            if len(nep_str) > 50 and len(eng_str) < len(nep_str) * 0.5:
                issues.append(f"Q{current_id}: English answer is significantly shorter ({len(eng_str)} chars) than Nepali ({len(nep_str)} chars).")

            # Check 4: LaTeX equations
            # If Nepali has equation ($...$) and English doesn't.
            if "$" in nep_str and "$" not in eng_str:
                 issues.append(f"Q{current_id}: Nepali has LaTeX ($) but English does not.")

        # Recurse
        for key, value in data.items():
            issues.extend(check_parity(value, filename, current_id))
            
    elif isinstance(data, list):
        for item in data:
            issues.extend(check_parity(item, filename, parent_id))
            
    return issues

def main():
    files = get_science_files()
    print(f"Scanning {len(files)} Science files...")
    
    total_issues = 0
    for file_path in files:
        filename = os.path.basename(file_path)
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                file_issues = check_parity(data, filename)
                
                if file_issues:
                    print(f"\nFile: {filename}")
                    for issue in file_issues:
                        print(f"  - {issue}")
                    total_issues += len(file_issues)
            except Exception as e:
                print(f"Error reading {filename}: {e}")

    print(f"\nTotal issues found: {total_issues}")

if __name__ == "__main__":
    main()
