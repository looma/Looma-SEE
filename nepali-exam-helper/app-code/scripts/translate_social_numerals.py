import json
import os

# Files to process
files = [
    "see_2081_social_practice_1_generated.json",
    "see_2081_social_practice_2_generated.json",
    "see_2081_social_practice_3_generated.json",
    "see_2081_social_practice_4_generated.json",
    "see_2081_social_practice_5_generated.json"
]

# Directory
data_dir = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"

# Mapping: Nepali -> English
nepali_to_english_map = str.maketrans("०१२३४५६७८९", "0123456789")

def translate_numerals_recursive(data):
    if isinstance(data, list):
        return [translate_numerals_recursive(item) for item in data]
    elif isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            new_value = value
            
            # Recurse first
            if isinstance(value, (list, dict)):
                new_value = translate_numerals_recursive(value)
            
            # If key ends in English and value is string, translate numerals
            if key.endswith("English") and isinstance(new_value, str):
                new_value = new_value.translate(nepali_to_english_map)
                
            new_dict[key] = new_value
        return new_dict
    else:
        return data

def process_file(file_name):
    file_path = os.path.join(data_dir, file_name)
    print(f"Processing {file_name}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {file_path}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: JSON Error in {file_name} - {e}")
        return

    # Process
    new_data = translate_numerals_recursive(data)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_name}")

if __name__ == "__main__":
    for file_name in files:
        process_file(file_name)
    print("Done.")
