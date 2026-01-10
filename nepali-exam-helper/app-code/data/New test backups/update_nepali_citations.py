import os
import re

def update_nepali_citations(directory):
    for filename in os.listdir(directory):
        if filename.startswith("see_2081_nepali_practice_") and filename.endswith(".json"):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Rule 1: Remove "Class 10, " from English citations.
                # Pattern: "Citation: Class 10, Lesson 13" -> "Citation: Lesson 13"
                # using regex: r'(Citation:\s*)Class 10,\s*' -> r'\1'
                new_content = re.sub(r'(Citation:\s*)Class 10,\s*', r'\1', content)

                # Rule 2: Remove "कक्षा १०, " from Nepali citations.
                # Pattern: "उद्धरण: कक्षा १०, पाठ १३" -> "उद्धरण: पाठ १३"
                # using regex: r'(उद्धरण:\s*)कक्षा १०,\s*' -> r'\1'
                new_content = re.sub(r'(उद्धरण:\s*)कक्षा १०,\s*', r'\1', new_content)

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
    update_nepali_citations(directory)
