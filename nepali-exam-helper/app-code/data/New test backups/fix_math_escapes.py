
import re
import os

def fix_file(filepath):
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  Error reading file: {e}")
        return

    original_content = content

    # Regex to find single backslashes that are NOT part of valid JSON escapes
    # Negative lookbehind (?<!\\) ensures we don't match the second backslash of \\
    # Negative lookahead (?![\\"/bfnrtu]) ensures we don't match valid escape chars
    # We want to replace matching '\' with '\\'
    
    # Correction: The regex needs to allow matching a backslash even if it's followed by something that looks like a valid escape char IF that escape char is actually part of a latex command (e.g. \beta -> \b matches \b escape).
    # Wait, \b is backspace. \beta in valid JSON string must be \\beta. 
    # If the file has "\beta", json parser sees \b (backspace) + eta. That is technically valid JSON but semantic garbage for LaTeX.
    # However, most LaTeX commands like \frac, \times, \alpha don't start with valid escape chars (f is formfeed, t is tab, a is NOT valid).
    # \a, \c, \p, \s, \% are the common ones causing syntax errors because they are NOT valid JSON escapes.
    
    # Strategy:
    # 1. Fix the definitely invalid ones (syntax errors): \ followed by NOT ["\/bfnrtu]
    content = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu])', r'\\\\', content)
    
    # 2. Fix ambiguous ones that are actually valid JSON escapes but likely intended as LaTeX?
    # This is dangerous. \t could be a tab or \tau. \n could be new line or \nu.
    # Given these are single line strings usually, literal tabs/newlines shouldn't exist?
    # Let's inspect the file content style. Usually newlines are \n.
    # We will stick to fixing SYNTAX ERRORS first (invalid escapes). 
    # If \beta becomes \b + eta, the JSON parser won't crash, but rendering might be wrong.
    # The user audit showed mismatches on \c, \s, \a, \p, \R, \%. These are all invalid escapes.
    # So the regex above covers the immediate blockers.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Fixed Syntax Errors in {os.path.basename(filepath)}")
    else:
        print(f"  No syntax errors found/fixed in {os.path.basename(filepath)}")

def main():
    base_dir = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"
    files = [f"see_2081_math_practice_{i}.json" for i in range(1, 10)]
    
    for filename in files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            fix_file(filepath)
        else:
            print(f"File not found: {filename}")

if __name__ == "__main__":
    main()
