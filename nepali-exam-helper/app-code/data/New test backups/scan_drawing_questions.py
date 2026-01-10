
import json
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

# Directory to scan
DIRECTORY = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

# Key phrases indicating a drawing task (Case Insensitive)
ENGLISH_KEYWORDS = [
    "draw", "sketch", "construct", "plot", "make a diagram", "show by chart", 
    "show by diagram", "trace", "label the diagram", "complete the table", 
    "fill in the table", "prepare a table", "venn-diagram", "venn diagram",
    "tree diagram", "show in a diagram", "show in a chart"
]

NEPALI_KEYWORDS = [
    "चित्र बनाउनुहोस्", "नक्सा कोर्नुहोस्", "तालिका बनाउनुहोस्", "चित्रमा देखाउनुहोस्", 
    "चित्र कोर्नुहोस्", "रेखाचित्र", "चार्टद्वारा देखाउनुहोस्", "नामाङ्कन गर्नुहोस्",
    "अंकित गर्नुहोस्", "भेन्चित्र", "रुख चित्र"
]

def scan_questions_recursive(data, filename, parent_id="Unknown"):
    if isinstance(data, dict):
        # Determine ID
        current_id = data.get("questionNumberEnglish") or \
                     data.get("questionNumberNepali") or \
                     data.get("question_numberEnglish") or \
                     data.get("question_numberNepali") or \
                     data.get("idEnglish") or \
                     data.get("idNepali") or \
                     data.get("labelEnglish") or \
                     parent_id
                     
        # Check text fields
        q_eng = str(data.get("questionEnglish", ""))
        q_nep = str(data.get("questionNepali", ""))
        
        found = False
        reason = ""
        
        # Check English
        if q_eng:
            q_lower = q_eng.lower()
            for kw in ENGLISH_KEYWORDS:
                if kw in q_lower:
                    # Filter out "Study the diagram", "Based on the diagram", "Figure shows"
                    exclude_phrases = ["study", "observe", "based on", "shown in", "given alongside", "look at"]
                    if not any(ex in q_lower for ex in exclude_phrases):
                        found = True
                        reason = f"English keyword '{kw}' found"
                        break
        
        # Check Nepali
        if not found and q_nep:
            for kw in NEPALI_KEYWORDS:
                if kw in q_nep:
                    exclude_nepali = ["अध्ययन", "हेर्नुहोस्", "आधारमा"]
                    if not any(ex in q_nep for ex in exclude_nepali):
                        found = True
                        reason = f"Nepali keyword '{kw}' found"
                        break
        
        if found:
            print(f"File: {filename} | Q: {current_id}")
            print(f"  Reason: {reason}")
            print(f"  Eng: {q_eng[:100]}...")
            print(f"  Nep: {q_nep[:100]}...")
            print("-" * 20)

        # Recurse
        for key, value in data.items():
            scan_questions_recursive(value, filename, current_id)
            
    elif isinstance(data, list):
        for item in data:
            scan_questions_recursive(item, filename, parent_id)

def process_file(filepath):
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        scan_questions_recursive(data, filename)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

def main():
    print("Scanning for Drawing/Diagram Questions...\n")
    files = [f for f in os.listdir(DIRECTORY) if f.endswith(".json")]
    for filename in files:
        process_file(os.path.join(DIRECTORY, filename))

if __name__ == "__main__":
    main()
