import json
import os
import re

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

def reorder_recursive(data):
    if isinstance(data, list):
        return [reorder_recursive(item) for item in data]
    elif isinstance(data, dict):
        new_dict = {}
        
        # handle _id first if exists
        if "_id" in data:
            new_dict["_id"] = data["_id"] # No recursion on _id usually needed, but safe to just copy
            # Note: _id value is usually string or oid object. if oid object, we might want to recurse?
            # actually usually _id is special. Let's just recurse to be safe if it's a dict.
            if isinstance(data["_id"], dict):
                new_dict["_id"] = reorder_recursive(data["_id"])
            
        
        handled_keys = set()
        if "_id" in data:
            handled_keys.add("_id")

        keys = list(data.keys())
        for key in keys:
            if key in handled_keys:
                continue
            
            # Check if this is a localized key
            # We look for keys ending in Nepali or English
            match = re.search(r'^(.*)(Nepali|English)$', key)
            
            if match:
                base = match.group(1)
                nepali_key = base + "Nepali"
                english_key = base + "English"
                
                # Check if BOTH exist in this level
                if nepali_key in data and english_key in data:
                    # Found a pair!
                    # Add Nepali first
                    new_dict[nepali_key] = reorder_recursive(data[nepali_key])
                    # Add English second
                    new_dict[english_key] = reorder_recursive(data[english_key])
                    
                    handled_keys.add(nepali_key)
                    handled_keys.add(english_key)
                    continue
            
            # If not a pair or just a standard key
            new_dict[key] = reorder_recursive(data[key])
            handled_keys.add(key)
            
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
    new_data = reorder_recursive(data)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_name}")

if __name__ == "__main__":
    for file_name in files:
        process_file(file_name)
    print("Done.")
