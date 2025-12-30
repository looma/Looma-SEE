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

# Desired field order (excluding _id which goes first)
ordered_fields = [
    "titleNepali",
    "titleEnglish",
    "subjectNepali",
    "subjectEnglish",
    "totalMarksNepali",
    "totalMarksEnglish",
    "durationNepali",
    "durationEnglish",
    "instructionsNepali",
    "instructionsEnglish"
]

def reorder_header(file_name):
    file_path = os.path.join(data_dir, file_name)
    print(f"Processing {file_name}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {file_path}")
        return

    if not isinstance(data, list) or len(data) == 0:
        print(f"Error: Invalid JSON structure in {file_name}")
        return

    header = data[0]
    new_header = {}

    # 1. _id (always first)
    if "_id" in header:
        new_header["_id"] = header["_id"]

    # 2. Ordered fields
    for field in ordered_fields:
        if field in header:
            new_header[field] = header[field]
        else:
            # Check if maybe instructions is missing or named differently?
            # Based on inspection, they look consistent, but good to be safe.
            print(f"Warning: Field '{field}' not found in {file_name}")

    # 3. Remaining fields (if any)
    for key, value in header.items():
        if key != "_id" and key not in ordered_fields:
            new_header[key] = value
            print(f"Info: Preserving extra field '{key}'")

    # Update data
    data[0] = new_header

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_name}")

if __name__ == "__main__":
    for file_name in files:
        reorder_header(file_name)
    print("Done.")
