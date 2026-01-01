import sys
import json
import os
import glob
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def audit_page_numbers():
    pattern = os.path.join(directory, "see_2081_*.json")
    files = glob.glob(pattern)
    
    print(f"Scanning {len(files)} files for page numbers in citations...\n")
    
    page_regex = re.compile(r'(page|Page|p\.|pp\.|पृष्ठ)\s*\d+', re.IGNORECASE)
    
    files_with_pages = 0
    total_matches = 0

    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            exam_data = data
            matches = []
            
            # Recursive function to find citations with page numbers
            def traverse_and_check(node):
                if isinstance(node, dict):
                    expl_en = node.get('explanationEnglish', '')
                    expl_ne = node.get('explanationNepali', '')
                    
                    q_id = node.get('questionNumberEnglish', node.get('idEnglish', node.get('questionNumberNepali', 'Unknown')))
                    
                    if isinstance(expl_en, str):
                        if page_regex.search(expl_en):
                             matches.append(f"  [ENGLISH] Q: {q_id} -> ...{page_regex.search(expl_en).group(0)}...")
                    
                    if isinstance(expl_ne, str):
                         if page_regex.search(expl_ne):
                             matches.append(f"  [NEPALI]  Q: {q_id} -> ...{page_regex.search(expl_ne).group(0)}...")

                    for value in node.values():
                        traverse_and_check(value)
                        
                elif isinstance(node, list):
                    for item in node:
                        traverse_and_check(item)

            traverse_and_check(exam_data)
            
            if matches:
                print(f"[FOUND] {filename}: {len(matches)} citations with page numbers")
                for match in matches:
                    print(match)
                files_with_pages += 1
                total_matches += len(matches)
            else:
                # print(f"[CLEAN] {filename}")
                pass

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

    if files_with_pages == 0:
        print("\nGood news! No page numbers found in any citations.")
    else:
        print(f"\nFound {total_matches} instances across {files_with_pages} files.")

if __name__ == "__main__":
    audit_page_numbers()
