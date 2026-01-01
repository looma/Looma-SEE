import sys
import json
import os
import glob
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def transform_map_questions():
    pattern = os.path.join(directory, "see_2081_social_practice_*.json")
    files = glob.glob(pattern)
    
    print(f"Processing {len(files)} Social exam files for transformation...\n")
    
    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        modified = False
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Helper to process a question node
            def process_question(q):
                nonlocal modified
                # Check for Map Drawing type or Q22
                if q.get('type') == 'map_drawing' or str(q.get('questionNumberEnglish')) == '22':
                    
                    # 1. Change Type
                    q['type'] = 'long_answer'
                    
                    # 2. Process Alternatives (Main and Option)
                    if 'alternatives' in q:
                        for alt in q['alternatives']:
                            # Extract items from the existing question text
                            # Pattern: Usually "Draw a map ... : [Item1, Item2...]"
                            # We split by colon usually
                            
                            q_en = alt.get('questionEnglish', '')
                            q_ne = alt.get('questionNepali', '')
                            
                            # Extract items English
                            items_en_text = ""
                            if ':' in q_en:
                                items_en_text = q_en.split(':', 1)[1].strip()
                            elif '\n' in q_en:
                                items_en_text = q_en.split('\n', 1)[1].strip()
                            else:
                                # Fallback if no specific separator found, just take valid looking text
                                items_en_text = q_en
                            
                            # Clean up items (remove newlines, handle commas)
                            # Sometimes items are comma separated, sometimes newline
                            if '\n' in items_en_text:
                                items_en_list = [i.strip() for i in items_en_text.split('\n') if i.strip()]
                            else:
                                items_en_list = [i.strip() for i in items_en_text.split(',') if i.strip()]

                            # Extract items Nepali
                            items_ne_text = ""
                            if ':' in q_ne:
                                items_ne_text = q_ne.split(':', 1)[1].strip()
                            elif '\n' in q_ne:
                                items_ne_text = q_ne.split('\n', 1)[1].strip()
                            else:
                                items_ne_text = q_ne
                                
                            if '\n' in items_ne_text:
                                items_ne_list = [i.strip() for i in items_ne_text.split('\n') if i.strip()]
                            else:
                                # comma or '। ' 
                                items_ne_list = [i.strip() for i in re.split(r',|।', items_ne_text) if i.strip()]

                            # 3. Construct New Questions
                            
                            # English Prompt
                            new_q_en = "Write the location (Province or Place) and one characteristic for each of the following geographical and cultural facts:\n"
                            for idx, item in enumerate(items_en_list, 1):
                                new_q_en += f"{idx}. {item}\n"
                            
                            # Nepali Prompt
                            new_q_ne = "निम्न भौगोलिक तथा साँस्कृतिक सम्पदाहरूको अवस्थिति (प्रदेश वा स्थान) र एक-एकवटा विशेषता लेख्नुहोस् :\n"
                            for idx, item in enumerate(items_ne_list, 1):
                                new_q_ne += f"{idx}. {item}\n"
                                
                            alt['questionEnglish'] = new_q_en.strip()
                            alt['questionNepali'] = new_q_ne.strip()
                            
                            # Remove visually impaired option if strictly text based now? 
                            # Actually, visually impaired option IS text based usually.
                            # But if the main question is now text based, the visually impaired option might be redundant or needs to be kept as an alternative choice.
                            # For now, we will leave it as is to be safe, or maybe it's just another alternative.
                            
                    # 4. Update Answer Key Instructions
                    q['answerEnglish'] = "(Students should correctly identify the location and characteristics of the listed items. Answers may vary slightly based on specific characteristics chosen.)"
                    q['answerNepali'] = "(विद्यार्थीले माथि उल्लिखित बुँदाहरूको सही अवस्थिति र विशेषता लेख्नुपर्नेछ ।)"
                    
                    modified = True
                    print(f"  - Transformed Q{q.get('questionNumberEnglish')} in {filename}")

            # Traverse to find questions
            # Usually in groups -> questions
            if isinstance(data, list):
                # Exam format logic
                for item in data:
                    if 'groups' in item:
                        for group in item['groups']:
                            for q in group['questions']:
                                process_question(q)
            elif isinstance(data, dict):
                 # Just in case other format
                 pass

            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"Successfully saved {filename}")
            else:
                print(f"No match found for Q22/map_drawing in {filename}")

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    transform_map_questions()
