import re
import glob
import os

files = [
    r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_1.json",
    r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_2.json"
]

valid_escapes = set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'])

for file_path in files:
    print(f"Checking {file_path}...")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        found_issues = False
        for i, line in enumerate(lines):
            # We want to find a backslash that is NOT properly escaped.
            # A backslash is valid if:
            # 1. It is followed by a valid escape char (" \ / b f n r t u)
            # 2. It is preceded by an ODD number of backslashes (meaning it is part of an escape sequence) -> No, actually:
            #    "\\" -> valid (literal backslash)
            #    "\\\"" -> valid (literal backslash then quote)
            #    "\\n" -> valid (literal backslash then n)
            #    "\n" -> valid (newline)
            #    "\T" -> INVALID.
            
            # Simple iteration approach
            idx = 0
            while idx < len(line):
                if line[idx] == '\\':
                    # Check next char
                    if idx + 1 >= len(line):
                        print(f"Line {i+1}: Trailing backslash at end of line")
                        found_issues = True
                        break
                    
                    next_char = line[idx+1]
                    if next_char in valid_escapes:
                        # Valid escape.
                        # If next_char is 'u', check 4 hex digits
                        if next_char == 'u':
                             # Check next 4 chars
                             pass # assume valid for now, or check length
                        
                        # Skip the escape sequence
                        # Case: \\ (literal backslash) -> we consumed both.
                        if next_char == '\\':
                            idx += 2
                            continue
                        else:
                            idx += 2
                            continue
                    else:
                        # INVALID ESCAPE!
                        # But wait, what if it was escaped by a previous backslash?
                        # No, because we consume double backslashes above.
                        # So if we are here, we saw a SINGLE backslash followed by an invalid char.
                        print(f"Line {i+1}: Invalid escape sequence '\\{next_char}'")
                        print(f"Context: ...{line[max(0, idx-10):min(len(line), idx+10)]}...")
                        found_issues = True
                        idx += 1 
                else:
                    idx += 1
                    
        if not found_issues:
            print("No invalid escapes found.")

    except Exception as e:
        print(f"Error reading {file_path}: {e}")
