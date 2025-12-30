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

def fix_file(filename):
    filepath = os.path.join(data_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Processing {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern: Look for correctAnswerNepali line, followed by one or more blank lines/newlines, then correctAnswerEnglish
    # We want to remove the blank lines between them.
    # The previous script likely produced: ...Nepali": "...",\n\n...English": "..."
    # We want ...Nepali": "...",\n...English": "..."
    
    # Regex explanation:
    # ("correctAnswerNepali": "[^"]+",)\s+("correctAnswerEnglish":)
    # matching the first part, then any amount of whitespace (including multiple newlines), then the second part.
    # We replace with first part + newline + indent + second part?
    # Actually, simpler: find `,\s*\n\s*\n(\s*)"correctAnswerEnglish"` and replace.
    
    # Let's try to match specifically the gap.
    # We expect: "correctAnswerNepali": "...",\n\n        "correctAnswerEnglish"
    # We want: "correctAnswerNepali": "...",\n        "correctAnswerEnglish"
    
    pattern = r'("correctAnswerNepali": "[iv]+",)(\r?\n\s*)(\r?\n\s*)("correctAnswerEnglish":)'
    # This expects exactly two newlines sequences.
    
    # More robust: Match Nepali line, then whitespace, then English line.
    # Capture the Nepali line, and the English line (with its indentation).
    # Reconstruct with single newline.
    
    pattern = r'("correctAnswerNepali": "[iv]+",)\s+("correctAnswerEnglish": "[iv]+")'
    
    def replacement(match):
        part1 = match.group(1) # "correctAnswerNepali": "ii","
        part2 = match.group(2) # "correctAnswerEnglish": "ii""
        
        # We need to preserve the indentation of part2.
        # But wait, match.group(2) starts with "correctAnswerEnglish".
        # We need to know the indentation.
        
        # Let's verify what we have in the file.
        # Line 57: [indent]"correctAnswerNepali": "ii",\n
        # Line 58: \n
        # Line 59: [indent]"correctAnswerEnglish": "ii",
        
        # S0 let's capture the indent from part 1?
        # No, part 1 is just the text.
        
        # Let's just do a simpler replace on the specific sequence of newlines if we can be sure.
        pass

    # New strategy:
    # Find `,\n\s*\n(\s*)"correctAnswerEnglish"`
    # Replace with `,\n\1"correctAnswerEnglish"`
    
    pattern2 = r',\s*\n\s*\n(\s*)"correctAnswerEnglish"'
    # \s* includes \n, so be careful.
    # We want to match exactly the double line break.
    
    # Safest way:
    # Read file line by line? No, regex on full content is fine if careful.
    
    # Pattern:
    # (whitespace)"correctAnswerNepali": "val",\n(whitespace)\n(whitespace)"correctAnswerEnglish"
    
    pattern3 = r'("correctAnswerNepali": "[^"]+",)\s*\n\s*("correctAnswerEnglish":)'
    
    # Let's try to just remove empty lines that follow correctAnswerNepali
    
    new_content = re.sub(r'("correctAnswerNepali": "[^"]+",)\n\s*\n(\s*"correctAnswerEnglish")', r'\1\n\2', content)
    
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {filename}")
    else:
        print(f"No changes needed for {filename}")

if __name__ == "__main__":
    for f in files_to_update:
        fix_file(f)
