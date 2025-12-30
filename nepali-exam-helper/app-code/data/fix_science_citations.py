
import json
import os
import re

def fix_science_citations():
    base_path = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"
    files = [f"see_2081_science_practice_{i}_generated.json" for i in range(1, 5)] # 1 to 4

    for filename in files:
        file_path = os.path.join(base_path, filename)
        if not os.path.exists(file_path):
            print(f"Skipping {filename} (not found)")
            continue
        
        print(f"Processing {filename}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Parse content (data[1])
        if len(data) > 1:
            process_node(data[1])

        # Write back
        temp_path = file_path + ".tmp"
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(temp_path, file_path)
        print(f"Updated {filename}")

def process_node(node):
    if isinstance(node, list):
        for item in node:
            process_node(item)
    elif isinstance(node, dict):
        # Check sampleAnswerEnglish
        if "sampleAnswerEnglish" in node:
            text = node["sampleAnswerEnglish"]
            if "Citation:" in text:
                node["sampleAnswerEnglish"] = consolidate_citations(text)
        
        # Recurse
        for key, val in node.items():
            process_node(val)

def consolidate_citations(text):
    # Find all citations like "Citation: Lesson X"
    # Regex to capture Lesson number. Case insensitive just in case, though audit showed standard.
    # Also handle trailing punct/whitespace line breaks around it.
    
    pattern = r'Citation:\s*Lesson\s*(\d+)'
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    if not matches:
        return text
    
    # Get unique lessons, sorted numerically
    unique_lessons = sorted(list(set(matches)), key=lambda x: int(x))
    
    # Remove all citation strings from text
    # We remove the whole line "Citation: Lesson X" and potential newlines.
    # Be careful not to merge words inappropriately.
    
    # Split lines to handle line-based removal safely
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        # Check if line contains citation
        # If line refers to citation ONLY, drop it.
        # If embedded, remove simple string.
        
        # Simple removal strategy: replace pattern with empty string
        # But handle context "Answer: ... \n Citation: Lesson X"
        
        # Let's use sub on the full text?
        # A bit risky if formatting is weird.
        # Let's iterate lines.
        if "Citation:" in line:
            # Remove just the citation part
            new_line = re.sub(pattern, '', line, flags=re.IGNORECASE).strip()
            # If line is now empty or just whitespace/punctuation, ignore it?
            # Or keep if it had other content.
            # Usually citation is on its own line or at end of bullet.
             
            if new_line:
                cleaned_lines.append(new_line)
        else:
            cleaned_lines.append(line)
            
    # Reassemble
    new_text = '\n'.join(cleaned_lines).strip()
    
    # Construct final citation
    # If multiple different lessons, user said "combine them".
    # Format: Citation: Lesson X (if all same)
    # or Citation: Lesson X, Lesson Y ?
    # Let's assume singular if unique count is 1.
    
    if len(unique_lessons) == 1:
        final_citation = f"Citation: Lesson {unique_lessons[0]}"
    else:
        # Multiple lessons
        lessons_str = ", ".join([f"Lesson {x}" for x in unique_lessons])
        final_citation = f"Citation: {lessons_str}"
        
    return f"{new_text}\n{final_citation}"

if __name__ == "__main__":
    fix_science_citations()
