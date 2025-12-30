import os
import json
import re

files_to_update = [
    "see_2081_science_practice_1_generated.json",
    "see_2081_science_practice_2_generated.json",
    "see_2081_science_practice_3_generated.json",
    "see_2081_science_practice_4_generated.json",
    "see_2081_science_practice_5_generated.json"
]

data_dir = os.path.join(os.path.dirname(__file__), "..", "data")

# Regex to match space(optional) + ( + English letters/numbers/spaces/symbols + )
# Updated to match:
# - space (optional)
# - (
# - any combination of: a-z, A-Z, 0-9, space, %, ,, ., -, &
# - )
# We want to be careful not to match things that look like Nepali or scientific formulas that SHOULD replace Nepali.
# But generally, anything in parentheses at the end of a Nepali string is a translation.
# Exception: Chemical formulas like (H2O) are usually NOT translations of the word "Water", but "Water (H2O)".
# However, if the field is "Nepali", and it says "पानी (Water)", we want "पानी".
# If it says "पानी (H2O)", we might want "पानी (H2O)"?
# The user said "remove this English".
# "(75% tall and 25% dwarf)" is clearly a translation.
# Let's use a broad ASCII match but require at least one English letter to avoid matching strictly numbers like "(1)".

pattern = re.compile(r'\s*\([a-zA-Z0-9\s%.,&-]+\)')

def clean_file(filename):
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
                if "options" in question:
                    for option in question["options"]:
                        if "Nepali" in option:
                            original = option["Nepali"]
                            # Apply regex
                            cleaned = pattern.sub("", original)
                            if cleaned != original:
                                option["Nepali"] = cleaned
                                changes_count += 1
                                # print(f"  Changed: '{original}' -> '{cleaned}'")

    if changes_count > 0:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Fixed {changes_count} options in {filename}")
    else:
        print(f"No changes needed for {filename}")

if __name__ == "__main__":
    for f in files_to_update:
        clean_file(f)
