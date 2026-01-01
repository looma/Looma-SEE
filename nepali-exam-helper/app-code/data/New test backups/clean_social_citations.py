import sys
import json
import os
import glob
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def clean_social_citations():
    pattern = os.path.join(directory, "see_2081_social_practice_*.json")
    files = glob.glob(pattern)
    
    print(f"Processing {len(files)} Social exam files...\n")
    
    # Regex to capture page numbers, optionally preceded by a comma/delimiter
    # Matches: ", Page 31", " Page 31", ", पृष्ठ ३१", " पृष्ठ ३१"
    regex_pattern = r'(?:,|၊)?\s*(?:Page|page|p\.|pp\.|पृष्ठ)\s*\d+'
    
    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Social exams have a 'groups' structure usually, or just check everything recursively
            exam_data = data
            modified_count = 0
            
            # Recursive function to find and clean citations
            def traverse_and_clean(node):
                nonlocal modified_count
                if isinstance(node, dict):
                    for key in ['explanationEnglish', 'explanationNepali']:
                        if key in node and isinstance(node[key], str):
                            original_text = node[key]
                            # Apply regex substitution
                            new_text = re.sub(regex_pattern, '', original_text, flags=re.IGNORECASE)
                            
                            if new_text != original_text:
                                node[key] = new_text
                                modified_count += 1
                                # print(f"Cleaned [{filename}]: ...{original_text[-40:]} -> ...{new_text[-40:]}")

                    for value in node.values():
                        traverse_and_clean(value)
                        
                elif isinstance(node, list):
                    for item in node:
                        traverse_and_clean(item)

            traverse_and_clean(exam_data)
            
            if modified_count > 0:
                print(f"Updated {filename}: Cleaned {modified_count} citations.")
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            else:
                print(f"No changes needed for {filename}")

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

if __name__ == "__main__":
    clean_social_citations()
