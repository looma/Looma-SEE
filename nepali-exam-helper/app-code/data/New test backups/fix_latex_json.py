import re
import os

files = [
    r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_1.json",
    r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_2.json"
]

ambiguous_commands = [
    'frac', 'forall', 
    'times', 'text', 'tan', 'theta', 'tau', 'triangle', 
    'beta', 'bar', 'begin', 'bf', 'big',
    'right', 'rho', 'rightarrow',
    'neq', 'nu', 'nabla'
]

def fix_content(content):
    original = content
    
    # Step 1: Fix invalid escapes (e.g. \c, \s, \a, \p, \R, \%)
    # Matches \ that is NOT preceded by \ and NOT followed by ["\/bfnrtu]
    content = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu])', r'\\\\', content)
    
    # Step 2: Fix ambiguous valid escapes that are actually LaTeX
    for cmd in ambiguous_commands:
        # Pattern: \cmd -> \\cmd
        # (?<!\\)\\(cmd)
        pattern = r'(?<!\\)\\' + cmd
        replacement = r'\\\\' + cmd
        content = re.sub(pattern, replacement, content)
        
    return content

for file_path in files:
    print(f"Fixing {file_path}...")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = fix_content(content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("Fixed.")
        else:
            print("No changes needed.")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
