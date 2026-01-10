import os
import json
import re

def update_citations(directory):
    for filename in os.listdir(directory):
        if filename.startswith("see_2081_english_practice_") and filename.endswith(".json"):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace "Citation: Lesson" with "Citation: Unit"
                # Case insensitive just in case, though the pattern seems consistent
                # Using regex to ensure we catch variations if any, but simple string replace might suffice
                # The user specified: "Lesson X" -> "Unit X"
                
                # Update English Explanation
                # Pattern: Citation: Lesson <number>
                new_content = re.sub(r'(Citation:\s*)Lesson(\s*\d+)', r'\1Unit\2', content)

                # Update Nepali Explanation
                # Pattern: उद्धरण: पाठ <number>
                # "पाठ" translates to "Lesson", changing to "एकाइ" (Unit)
                new_content = re.sub(r'(उद्धरण:\s*)पाठ(\s*\d+)', r'\1एकाइ\2', new_content)

                if content != new_content:
                    print(f"Updating {filename}...")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                else:
                    print(f"No changes needed for {filename}")

            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    update_citations(directory)
