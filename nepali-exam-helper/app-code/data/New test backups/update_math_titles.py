import sys
import json
import os
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def update_titles():
    for i in range(1, 6):
        filename = f"see_2081_math_practice_{i}.json"
        filepath = os.path.join(directory, filename)
        
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Assuming the structure is a list with one object as seen in file 1
            if isinstance(data, list) and len(data) > 0:
                exam = data[0]
            elif isinstance(data, dict):
                exam = data
            else:
                 print(f"Skipping {filename}: Unexpected JSON structure")
                 continue

            # Update English Title
            new_title_english = f"SEE 2081 Math Practice Test {i}"
            old_title_english = exam.get('titleEnglish', '')
            exam['titleEnglish'] = new_title_english
            
            # Update Nepali Title
            old_title_nepali = exam.get('titleNepali', '')
            # Regex to remove (75 marks) or (७५ पूर्णाङ्क) and surrounding whitespace
            # It looks for signatures like (75 Marks), (75 marks), (७५ पूर्णाङ्क)
            new_title_nepali = re.sub(r'\s*\(\s*(75|७५)\s*(marks|Marks|पूर्णाङ्क)\s*\)', '', old_title_nepali)
            new_title_nepali = new_title_nepali.strip()
            exam['titleNepali'] = new_title_nepali
            
            print(f"Updated {filename}:")
            print(f"  Old English: {old_title_english} -> New: {new_title_english}")
            print(f"  Old Nepali:  {old_title_nepali} -> New: {new_title_nepali}")
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    update_titles()
