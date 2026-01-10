
import json
import os
import sys

# Force UTF-8 output for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Directory to scan
DIRECTORY = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def find_slashes_recursive(data, filename, parent_q_id="Unknown"):
    if isinstance(data, dict):
        # enhance ID extraction
        # In this schema, questions have 'idEnglish', 'idNepali' inside group list items.
        # But 'questionNumberEnglish' might not exist.
        current_id = data.get("questionNumberEnglish")
        if not current_id:
            current_id = data.get("questionNumberNepali")
        if not current_id:
            current_id = data.get("idEnglish") # e.g. "a", "b"
        if not current_id:
            current_id = data.get("idNepali")
            
        # If we enter a sub-structure, we might want to keep the parent ID if current is not found?
        # But data here is recursive.
        effective_id = current_id if current_id else parent_q_id
        
        # Check specific answer keys
        for key, value in data.items():
            if "answer" in key.lower() and isinstance(value, str):
                if "/" in value:
                    # Filter out common false positives if necessary, e.g. units "m/s", "N/m^2"
                    # But user wants to check delimiter. Let's print everything first.
                    print(f"File: {filename} | ID: {effective_id}")
                    print(f"  Field: {key}")
                    print(f"  Value: {value}")
                    print("-" * 20)
        
        # Recurse values
        for key, value in data.items():
            find_slashes_recursive(value, filename, effective_id)
            
    elif isinstance(data, list):
        for item in data:
            find_slashes_recursive(item, filename, parent_q_id)

def process_file(filepath):
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        find_slashes_recursive(data, filename)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

def main():
    print("Scanning Science Exams for '/' in answer fields...\n")
    
    for i in range(1, 6):
        filename = f"see_2081_science_practice_{i}_generated.json"
        filepath = os.path.join(DIRECTORY, filename)
        if os.path.exists(filepath):
            process_file(filepath)
        else:
            print(f"File not found: {filename}")

if __name__ == "__main__":
    main()
