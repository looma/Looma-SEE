import os
import json

files_to_update = [
    "see_2081_science_practice_1_generated.json",
    "see_2081_science_practice_2_generated.json",
    "see_2081_science_practice_3_generated.json",
    "see_2081_science_practice_4_generated.json",
    "see_2081_science_practice_5_generated.json"
]

data_dir = os.path.join(os.path.dirname(__file__), "..", "data")

english_to_nepali = str.maketrans("0123456789", "०१२३४५६७८९")

def translate_file(filename):
    filepath = os.path.join(data_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Processing {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    changes_count = 0

    if "questions" in data:
        for group_name, questions in data["questions"].items():
            for question in questions:
                # Check if idEnglish exists and is numeric
                if "idEnglish" in question and "idNepali" in question:
                    id_eng = str(question["idEnglish"]).strip()
                    if id_eng.isdigit():
                        translated_id = id_eng.translate(english_to_nepali)
                        if question["idNepali"] != translated_id:
                            # print(f"  Translating ID: {id_eng} -> {translated_id}")
                            question["idNepali"] = translated_id
                            changes_count += 1

    if changes_count > 0:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {changes_count} IDs in {filename}")
    else:
        print(f"No ID changes needed for {filename}")

if __name__ == "__main__":
    for f in files_to_update:
        translate_file(f)
