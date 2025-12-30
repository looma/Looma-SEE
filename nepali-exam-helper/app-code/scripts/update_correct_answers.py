import os
import re

files_to_update = [
    "see_2081_science_practice_1_generated.json",
    "see_2081_science_practice_2_generated.json",
    "see_2081_science_practice_3_generated.json",
    "see_2081_science_practice_4_generated.json",
    "see_2081_science_practice_5_generated.json"
]

data_dir = os.path.join(os.path.dirname(__file__), "..", "data")

def update_file(filename):
    filepath = os.path.join(data_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Processing {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Define replacements using regex to capture indentation
    # Pattern: "correctAnswer": "value" -> "correctAnswerNepali": "value",\n[indent]"correctAnswerEnglish": "value"
    
    pattern = r'(\s*)"correctAnswer": "([iv]+)"'
    
    def replacement(match):
        indent = match.group(1)
        value = match.group(2)
        # Using the same indentation for the new line
        return f'{indent}"correctAnswerNepali": "{value}",\n{indent}"correctAnswerEnglish": "{value}"'

    new_content = re.sub(pattern, replacement, content)

    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No changes made to {filename}")

if __name__ == "__main__":
    for f in files_to_update:
        update_file(f)
