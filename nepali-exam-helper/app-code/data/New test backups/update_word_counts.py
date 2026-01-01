import json
import os

# Map for English to Nepali numerals
english_to_nepali_map = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
}

def to_nepali_numeral(n):
    return "".join(english_to_nepali_map[d] for d in str(n))

def transform_obj(obj):
    if isinstance(obj, list):
        return [transform_obj(item) for item in obj]
    elif isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if k == 'wordCount':
                # Add wordCountNepali first
                nepali_val = to_nepali_numeral(v)
                new_obj['wordCountNepali'] = nepali_val
                # Then wordCountEnglish
                new_obj['wordCountEnglish'] = v
            else:
                new_obj[k] = transform_obj(v)
        return new_obj
    else:
        return obj

def process_file(file_path):
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        new_data = transform_obj(data)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        print(f"Successfully processed {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    target_dir = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    files = [
        "see_2081_english_practice_1_generated.json",
        "see_2081_english_practice_2_generated.json",
        "see_2081_english_practice_3_generated.json",
        "see_2081_english_practice_4_generated.json",
        "see_2081_english_practice_5_generated.json"
    ]
    
    for filename in files:
        file_path = os.path.join(target_dir, filename)
        if os.path.exists(file_path):
            process_file(file_path)
        else:
            print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()
