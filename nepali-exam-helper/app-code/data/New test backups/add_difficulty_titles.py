import sys
import json
import os
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def add_difficulty():
    # Exams 6 and 7: Harder / कठिन
    for i in [6, 7]:
        process_file(i, " (Harder)", " (कठिन)")

    # Exams 8 and 9: Hardest / अति कठिन
    for i in [8, 9]:
        process_file(i, " (Hardest)", " (अति कठिन)")

def process_file(exam_num, english_suffix, nepali_suffix):
    filename = f"see_2081_math_practice_{exam_num}.json"
    filepath = os.path.join(directory, filename)
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, list) and len(data) > 0:
            exam = data[0]
        elif isinstance(data, dict):
            exam = data
        else:
            print(f"Skipping {filename}: Unexpected JSON structure")
            return

        # Update English Title
        old_title_english = exam.get('titleEnglish', '')
        if english_suffix not in old_title_english:
             exam['titleEnglish'] = old_title_english + english_suffix

        # Update Nepali Title
        old_title_nepali = exam.get('titleNepali', '')
        if nepali_suffix not in old_title_nepali:
            exam['titleNepali'] = old_title_nepali + nepali_suffix
        
        print(f"Updated {filename}:")
        print(f"  English: {exam['titleEnglish']}")
        print(f"  Nepali:  {exam['titleNepali']}")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    add_difficulty()
