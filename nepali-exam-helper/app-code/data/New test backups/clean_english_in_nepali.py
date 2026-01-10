import os
import json
import re
import sys

def clean_english_in_nepali(directory):
    sys.stdout.reconfigure(encoding='utf-8')
    modified_count = 0
    
    # Pattern to match: (English Text)
    # Matches parens containing only letters and spaces.
    pattern = re.compile(r'\([A-Za-z\s]+\)')
    
    romans = set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'])
    whitelist_extras = set(['dna', 'rna'])

    def replacement_func(match):
        content = match.group(0)[1:-1] # Remove parens
        stripped = content.strip()
        lower = stripped.lower()
        
        # Keep if Roman numeral
        if lower in romans:
            return match.group(0)
            
        # Keep if length <= 2 (e.g. IA, UV, pH, s, l, g, m)
        if len(stripped) <= 2:
            return match.group(0)
            
        # Keep specific extras
        if lower in whitelist_extras:
            return match.group(0)
            
        # Otherwise remove
        return ""

    for filename in os.listdir(directory):
        if filename.startswith("see_2081_science_practice_") and filename.endswith(".json"):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                print(f"Processing {filename}...")
                file_modified = False
                
                # Recursive function to traverse and modify
                def traverse_and_clean(obj):
                    nonlocal file_modified
                    if isinstance(obj, dict):
                        for key, value in obj.items():
                            if key == "sampleAnswerNepali" and isinstance(value, str):
                                new_value = pattern.sub(replacement_func, value)
                                # Clean up double spaces resulted from removal
                                new_value = re.sub(r'\s{2,}', ' ', new_value)
                                # Clean up space before punctuation if any (e.g. "word .")
                                new_value = re.sub(r'\s+([।,.])', r'\1', new_value)
                                new_value = new_value.strip()
                                
                                if new_value != value:
                                    print(f"  Modified: \n    Old: {value}\n    New: {new_value}")
                                    obj[key] = new_value
                                    file_modified = True
                            else:
                                traverse_and_clean(value)
                    elif isinstance(obj, list):
                        for item in obj:
                            traverse_and_clean(item)

                traverse_and_clean(data)
                
                if file_modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=4, ensure_ascii=False)
                    modified_count += 1
                    print(f"  Updated {filename}")

            except Exception as e:
                print(f"Error processing {filename}: {e}")
                import traceback
                traceback.print_exc()

    print(f"\nTotal files modified: {modified_count}")

if __name__ == "__main__":
    directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    clean_english_in_nepali(directory)
