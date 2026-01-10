
import json
import os

# Directory to scan
DIRECTORY = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def clean_value(value):
    """
    Recursively remove '**' from strings in the data structure.
    """
    if isinstance(value, str):
        if "**" in value:
            return value.replace("**", "")
        return value
    elif isinstance(value, dict):
        return {k: clean_value(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [clean_value(v) for v in value]
    else:
        return value

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Clean the data
        cleaned_data = clean_value(data)
        
        # Check if changes were made by comparing string dump (inefficient but safe) 
        # or simplified: just write it back if we want to be sure. 
        # Actually, let's just write validation logic: check if content changed.
        # But for simplicity in this script, we can just overwrite if clean_value is deterministic.
        # To be cleaner, I'll compare the original data with cleaned_data.
        
        if data != cleaned_data:
            print(f"Modifying: {os.path.basename(filepath)}")
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(cleaned_data, f, indent=4, ensure_ascii=False)
        else:
            print(f"No changes needed: {os.path.basename(filepath)}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    print(f"Scanning directory: {DIRECTORY}")
    files = [f for f in os.listdir(DIRECTORY) if f.endswith(".json")]
    
    for filename in files:
        filepath = os.path.join(DIRECTORY, filename)
        process_file(filepath)
    
    print("Done.")

if __name__ == "__main__":
    main()
