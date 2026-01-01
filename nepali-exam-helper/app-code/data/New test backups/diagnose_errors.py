import re
import os
import sys

# Set output to file to avoid encoding issues
output_file = "errors.txt"

# List of all 9 files
directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
files = [os.path.join(directory, f"see_2081_math_practice_{i}.json") for i in range(1, 10)]

valid_escapes = set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'])

with open(output_file, 'w', encoding='utf-8') as out:
    for file_path in files:
        out.write(f"Checking {os.path.basename(file_path)}...\n")
        if not os.path.exists(file_path):
            out.write(f"File not found: {file_path}\n")
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            
            for i, line in enumerate(lines):
                idx = 0
                while idx < len(line):
                    if line[idx] == '\\':
                        # Check next char
                        if idx + 1 >= len(line):
                            out.write(f"Line {i+1}: Trailing backslash at end of line\n")
                            break
                        
                        next_char = line[idx+1]
                        if next_char in valid_escapes:
                            # Valid escape.
                            if next_char == '\\':
                                idx += 2
                                continue
                            else:
                                idx += 2
                                continue
                        else:
                            # INVALID ESCAPE found
                            out.write(f"Line {i+1}: Invalid escape sequence '\\{next_char}'\n")
                            # Write safe context
                            start = max(0, idx-10)
                            end = min(len(line), idx+10)
                            context = line[start:end]
                            out.write(f"Context: ...{context}...\n")
                            idx += 1 
                    else:
                        idx += 1

        except Exception as e:
            out.write(f"Error reading {file_path}: {e}\n")
            
print("Done. Check errors.txt")
