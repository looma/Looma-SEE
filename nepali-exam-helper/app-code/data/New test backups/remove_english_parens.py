import json
import os
import re

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

# Regex to match English text in parentheses.
# Matches: space(optional) + ( + one or more english letters/spaces + )
# We want to be careful not to remove (क), (ख) etc or numbers (1).
# So we enforce that the content must start with an English letter.
REGEX_PATTERN = r'\s*\([a-zA-Z][a-zA-Z\s\/\.,-]*\)'

def process_value(val):
    if isinstance(val, str):
        # Apply regex replacement
        new_val, count = re.subn(REGEX_PATTERN, '', val)
        return new_val, count
    return val, 0

def recursive_clean(obj, parent_key=None):
    modified_count = 0
    
    if isinstance(obj, dict):
        for k, v in obj.items():
            # Check if key indicates Nepali content
            if isinstance(k, str) and "Nepali" in k:
                if isinstance(v, str):
                    new_val, count = process_value(v)
                    if count > 0:
                        try:
                            print(f"Modifying '{k}':\n  Old: {v}\n  New: {new_val}\n")
                        except UnicodeEncodeError:
                            print(f"Modifying '{k}': [Content contains special characters, suppressed]")
                        obj[k] = new_val
                        modified_count += count
                elif isinstance(v, list) or isinstance(v, dict):
                     modified_count += recursive_clean(v, k)
            
            # Recurse even if key doesn't say Nepali, as structure might be deep
            elif isinstance(v, (dict, list)):
                modified_count += recursive_clean(v, k)
                
    elif isinstance(obj, list):
        for item in obj:
            modified_count += recursive_clean(item, parent_key)
            
    return modified_count

def main():
    for i in range(1, 6):
        filename = f"see_2081_english_practice_{i}_generated.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(filepath):
            continue
            
        print(f"Processing {filename}...")
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        count = recursive_clean(data)
        
        if count > 0:
            print(f"cleaned {count} instances in {filename}")
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            print(f"No changes in {filename}")

if __name__ == "__main__":
    main()
