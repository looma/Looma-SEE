import sys
import json
import os
import glob
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def find_map_questions():
    pattern = os.path.join(directory, "see_2081_social_practice_*.json")
    files = glob.glob(pattern)
    
    print(f"Scanning {len(files)} Social exam files for map drawing questions...\n")
    
    map_keywords_en = ["draw a map", "sketch a map", "outline map"]
    map_keywords_ne = ["नक्सा बनाउनुहोस्", "नक्सा कोर्नुहोस्"]

    results = {}

    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        found_in_file = []
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Recursive function to find questions
            def traverse_and_find(node):
                if isinstance(node, dict):
                    # Check if it's a question
                    # Criteria 1: explicit type
                    is_map_type = node.get('type') == 'map_drawing'
                    
                    # Criteria 2: text content
                    q_text_en = node.get('questionEnglish', '')
                    q_text_ne = node.get('questionNepali', '')
                    
                    has_map_text = False
                    if isinstance(q_text_en, str) and any(k in q_text_en.lower() for k in map_keywords_en):
                        has_map_text = True
                    if isinstance(q_text_ne, str) and any(k in q_text_ne for k in map_keywords_ne):
                        has_map_text = True
                        
                    if is_map_type or has_map_text:
                        q_num = node.get('questionNumberEnglish', node.get('idEnglish', 'Unknown'))
                        found_in_file.append({
                            'id': q_num,
                            'type': node.get('type', 'unknown'),
                            'text': q_text_en[:100] + "..." if len(q_text_en) > 100 else q_text_en
                        })

                    # Recurse
                    for key, value in node.items():
                        traverse_and_find(value)
                        
                elif isinstance(node, list):
                    for item in node:
                        traverse_and_find(item)

            traverse_and_find(data)
            
            if found_in_file:
                results[filename] = found_in_file
                print(f"FOUND in {filename}:")
                for item in found_in_file:
                    print(f"  - Q{item['id']} (Type: {item['type']}): {item['text']}")
            else:
                print(f"No map questions found in {filename}")

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

if __name__ == "__main__":
    find_map_questions()
