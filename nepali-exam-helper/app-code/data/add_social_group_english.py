#!/usr/bin/env python3
"""
Add English group fields to Social Studies JSON files.
This script adds groupNameEnglish, groupInstructionEnglish, and marksSchemaEnglish
to each group in the Social Studies JSON files.
"""

import json
import glob
import re
import os

# Standard group translations
GROUP_NAME_TRANSLATIONS = {
    "समूह 'क'": "Group 'A'",
    "समूह 'ख'": "Group 'B'",
    "समूह 'ग'": "Group 'C'",
    "समूह 'घ'": "Group 'D'",
}

GROUP_INSTRUCTION_TRANSLATIONS = {
    "तलका प्रश्नहरूको अति छोटो उत्तर दिनुहोस् :": "Give very short answers to the following questions:",
    "तलका प्रश्नहरूको छोटो उत्तर दिनुहोस् :": "Give short answers to the following questions:",
    "तलका प्रश्नहरूको लामो उत्तर दिनुहोस् :": "Give long answers to the following questions:",
}

def convert_nepali_marks_schema(nepali_schema):
    """Convert Nepali marks schema to English format."""
    if not nepali_schema:
        return ""
    
    # Nepali to Arabic digit mapping
    nepali_digits = {'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', 
                     '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'}
    
    result = nepali_schema
    for nepali, arabic in nepali_digits.items():
        result = result.replace(nepali, arabic)
    
    return result

def add_english_group_fields(file_path):
    """Add English fields to groups in a Social Studies JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    
    for doc in data:
        if 'groups' in doc:
            for group in doc['groups']:
                # Add groupNameEnglish
                if 'groupName' in group and 'groupNameEnglish' not in group:
                    group['groupNameEnglish'] = GROUP_NAME_TRANSLATIONS.get(
                        group['groupName'], 
                        group['groupName']  # fallback to original if not found
                    )
                    modified = True
                
                # Add groupInstructionEnglish
                if 'groupInstruction' in group and 'groupInstructionEnglish' not in group:
                    group['groupInstructionEnglish'] = GROUP_INSTRUCTION_TRANSLATIONS.get(
                        group['groupInstruction'],
                        "Answer the following questions:"  # default fallback
                    )
                    modified = True
                
                # Add marksSchemaEnglish
                if 'marksSchema' in group and 'marksSchemaEnglish' not in group:
                    group['marksSchemaEnglish'] = convert_nepali_marks_schema(group['marksSchema'])
                    modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes needed: {file_path}")
    
    return modified

def main():
    # Find all Social Studies JSON files in the data folder
    data_dir = os.path.dirname(os.path.abspath(__file__))
    pattern = os.path.join(data_dir, 'see_*_social_*.json')
    
    files = glob.glob(pattern)
    
    if not files:
        print(f"No Social Studies files found matching pattern: {pattern}")
        return
    
    print(f"Found {len(files)} Social Studies files")
    
    for file_path in sorted(files):
        try:
            add_english_group_fields(file_path)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == '__main__':
    main()
