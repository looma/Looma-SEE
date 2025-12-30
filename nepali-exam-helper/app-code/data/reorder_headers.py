import json
import os

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"

files = [
    "see_2081_nepali_practice_1_generated.json",
    "see_2081_nepali_practice_2_generated.json",
    "see_2081_nepali_practice_3_generated.json",
    "see_2081_nepali_practice_4_generated.json",
    "see_2081_nepali_practice_5_generated.json"
]

def process_file(file_path):
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list) or len(data) == 0:
            print(f"Skipping {file_path}: Invalid JSON structure (expected list)")
            return

        header = data[0]
        
        # Check if instruction fields exist
        if 'instructionsNepali' not in header or 'instructionsEnglish' not in header:
            print(f"Skipping {file_path}: Instruction fields not found in header")
            print(f"Keys found: {list(header.keys())}")
            return

        # Create new header with preserving order of other fields
        new_header = {}
        
        # Add all fields EXCEPT instructions
        for key, value in header.items():
            if key not in ['instructionsNepali', 'instructionsEnglish']:
                new_header[key] = value
        
        # Add instructions at the end
        new_header['instructionsNepali'] = header['instructionsNepali']
        new_header['instructionsEnglish'] = header['instructionsEnglish']

        # Replace header
        data[0] = new_header

        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully updated {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

for file_name in files:
    process_file(os.path.join(directory, file_name))
