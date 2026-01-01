import sys
import json
import os
import glob

# Set stdout to utf-8 safely
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def reorder_q22():
    pattern = os.path.join(directory, "see_2081_social_practice_*.json")
    files = glob.glob(pattern)
    
    print(f"Reordering Q22 in {len(files)} files...\n")
    
    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        modified = False
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Helper to check if it's Q22
            def is_q22(q):
                return str(q.get('questionNumberEnglish')) == '22'
                
            # Helper to reorder dictionary
            def reorder_dict(old_q):
                new_q = {}
                # Desired order
                order = ['type', 'questionNepali', 'questionEnglish', 'answerNepali']
                
                # 1. Add specific priority fields if they exist
                for key in order:
                    if key in old_q:
                        new_q[key] = old_q[key]
                        
                # 2. Add all other fields that were not in the priority list
                # This keeps 'answerEnglish', 'explanation...', etc. after 'answerNepali'
                # but their relative order from original dict is preserved (usually)
                for key, value in old_q.items():
                    if key not in new_q:
                        new_q[key] = value
                        
                return new_q

            # Traverse
            if isinstance(data, list):
                for item in data:
                    if 'groups' in item:
                        for group in item['groups']:
                            questions = group.get('questions', [])
                            for i, q in enumerate(questions):
                                if is_q22(q):
                                    # Found Q22, replace it with reordered version
                                    group['questions'][i] = reorder_dict(q)
                                    modified = True
                                    print(f"  - Reordered Q22 in {filename}")
            
            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"Successfully saved {filename}")
            else:
                 print(f"Q22 not found in {filename}")

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

if __name__ == "__main__":
    reorder_q22()
