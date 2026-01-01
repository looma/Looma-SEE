#!/usr/bin/env python3
"""
Normalize math test JSON files to ensure all bilingual fields are present.
This handles:
1. Missing labelNepali (derive from labelEnglish)
2. Missing question_numberNepali (derive from question_numberEnglish)
3. Missing marksNepali (derive from marksEnglish)
4. Ensures both split-root and single-object formats are valid
"""

import json
import os
import glob

# Nepali digit mapping
NEPALI_DIGITS = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
}

# Label mapping (English to Nepali)
LABEL_MAP = {
    'a': 'क', 'b': 'ख', 'c': 'ग', 'd': 'घ', 'e': 'ङ',
    'f': 'च', 'g': 'छ', 'h': 'ज', 'i': 'झ', 'j': 'ञ'
}

def to_nepali_number(num):
    """Convert a number or string to Nepali numerals."""
    if num is None:
        return None
    s = str(num)
    return ''.join(NEPALI_DIGITS.get(c, c) for c in s)

def to_nepali_label(label):
    """Convert English label (a, b, c) to Nepali (क, ख, ग)."""
    if not label:
        return None
    return LABEL_MAP.get(label.lower(), label)

def normalize_sub_question(sub_q):
    """Ensure a sub-question has all bilingual fields."""
    # Label
    if 'labelEnglish' in sub_q and 'labelNepali' not in sub_q:
        sub_q['labelNepali'] = to_nepali_label(sub_q['labelEnglish'])
    elif 'labelNepali' in sub_q and 'labelEnglish' not in sub_q:
        # Reverse map if needed
        reverse_map = {v: k for k, v in LABEL_MAP.items()}
        sub_q['labelEnglish'] = reverse_map.get(sub_q['labelNepali'], sub_q['labelNepali'])
    
    # Marks
    if 'marksEnglish' in sub_q and 'marksNepali' not in sub_q:
        sub_q['marksNepali'] = to_nepali_number(sub_q['marksEnglish'])
    elif 'marksNepali' in sub_q and 'marksEnglish' not in sub_q:
        # Try to parse Nepali numeral
        try:
            sub_q['marksEnglish'] = int(sub_q['marksNepali'].translate(
                str.maketrans('०१२३४५६७८९', '0123456789')
            ))
        except:
            sub_q['marksEnglish'] = 1
    
    return sub_q

def normalize_question(question):
    """Ensure a question has all bilingual fields."""
    # Question number
    if 'question_numberEnglish' in question and 'question_numberNepali' not in question:
        question['question_numberNepali'] = to_nepali_number(question['question_numberEnglish'])
    elif 'question_numberNepali' in question and 'question_numberEnglish' not in question:
        try:
            question['question_numberEnglish'] = int(question['question_numberNepali'].translate(
                str.maketrans('०१२३४५६७८९', '0123456789')
            ))
        except:
            pass
    
    # Normalize sub-questions
    if 'sub_questions' in question:
        question['sub_questions'] = [normalize_sub_question(sq) for sq in question['sub_questions']]
    
    return question

def normalize_math_test(data):
    """Normalize a math test JSON structure."""
    if not isinstance(data, list):
        print(f"  Warning: Expected array, got {type(data)}")
        return data
    
    for doc in data:
        # Normalize metadata
        if 'titleEnglish' in doc and 'titleNepali' not in doc:
            # Can't auto-translate title, just note it
            print("  Warning: Missing titleNepali")
        
        # Normalize questions array
        questions = doc.get('questions', [])
        if isinstance(questions, list):
            doc['questions'] = [normalize_question(q) for q in questions]
    
    return data

def main():
    data_dir = os.path.dirname(os.path.abspath(__file__))
    math_files = glob.glob(os.path.join(data_dir, 'see_2081_math_practice_*.json'))
    
    print(f"Found {len(math_files)} math test files")
    
    for filepath in sorted(math_files):
        filename = os.path.basename(filepath)
        print(f"\nProcessing: {filename}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            normalized = normalize_math_test(data)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(normalized, f, ensure_ascii=False, indent=2)
            
            print(f"  ✓ Normalized successfully")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")

if __name__ == '__main__':
    main()
