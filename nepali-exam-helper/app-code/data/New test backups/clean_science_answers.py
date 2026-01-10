
import json
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

# Directory to scan
DIRECTORY = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def clean_prefixes_recursive(data, filename, modified=False):
    if isinstance(data, dict):
        # Check specific answer keys
        
        # English
        if "sampleAnswerEnglish" in data and isinstance(data["sampleAnswerEnglish"], str):
            original = data["sampleAnswerEnglish"]
            if original.startswith("Answer: "):
                data["sampleAnswerEnglish"] = original[len("Answer: "):] # Remove prefix
                modified = True
                # print(f"Cleaned English in {filename}: {original[:20]}...")

        # Nepali
        if "sampleAnswerNepali" in data and isinstance(data["sampleAnswerNepali"], str):
            original = data["sampleAnswerNepali"]
            if original.startswith("उत्तर: "):
                data["sampleAnswerNepali"] = original[len("उत्तर: "):] # Remove prefix
                modified = True
                # print(f"Cleaned Nepali in {filename}: {original[:20]}...")

        # Recurse values
        for key, value in data.items():
            if clean_prefixes_recursive(value, filename):
                modified = True
            
    elif isinstance(data, list):
        for item in data:
            if clean_prefixes_recursive(item, filename):
                modified = True
                
    return modified

def process_file(filepath):
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if clean_prefixes_recursive(data, filename):
            print(f"Modifying: {filename}")
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        else:
            print(f"No changes needed: {filename}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

def main():
    print("Cleaning Science Exams Prefixes...\n")
    
    for i in range(1, 6):
        filename = f"see_2081_science_practice_{i}_generated.json"
        filepath = os.path.join(DIRECTORY, filename)
        if os.path.exists(filepath):
            process_file(filepath)
        else:
            print(f"File not found: {filename}")

if __name__ == "__main__":
    main()
