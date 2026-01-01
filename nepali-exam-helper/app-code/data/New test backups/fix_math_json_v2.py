import re
import os

files = [
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_6.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_7.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_8.json",
    r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups/see_2081_math_practice_9.json"
]

def fix_escapes_v2(text):
    # Pattern: Sequence of backslashes (\+) followed by a character that is NOT a valid JSON escape
    # Valid escapes: / b f n r t u " \
    # We capture the slashes in group 1, and the following char in group 2.
    pattern = r'(\\+)([^/bfnrtu"\\\\])'
    
    def replacer(match):
        slashes = match.group(1)
        char = match.group(2)
        n = len(slashes)
        
        # If number of backslashes is odd, it means we have an unescaped backslash 
        # (or 3, 5, etc.) followed by a non-special char.
        # Examples:
        # \c (n=1) -> Invalid. Fix: \\c (n=2)
        # \\\c (n=3) -> Invalid. Fix: \\c (n=2)
        # \\\\\c (n=5) -> Invalid. Fix: \\\\c (n=4)
        
        if n % 2 != 0:
            if n > 1:
                new_n = n - 1
            else:
                new_n = 2
            return ("\\" * new_n) + char
        else:
            # Even number of slashes (e.g. \\c, \\\\c).
            # \\c -> \ escaped, followed by c. Valid string content "\c".
            # \\\\c -> \\ escaped, \\ escaped, followed by c. Valid string content "\\c".
            # So leave as is.
            return match.group(0)

    return re.sub(pattern, replacer, text)

for file_path in files:
    if os.path.exists(file_path):
        print(f"Processing {os.path.basename(file_path)}...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            fixed_content = fix_escapes_v2(content)
            
            if content != fixed_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                print(f"  Fixed.")
            else:
                print(f"  No changes needed.")
        except Exception as e:
            print(f"  Error: {e}")
    else:
        print(f"File not found: {file_path}")
