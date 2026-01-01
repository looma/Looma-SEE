import os
import json

target_dir = r"c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data/New test backups"

print(f"Searching in {target_dir}...")

for filename in os.listdir(target_dir):
    if filename.endswith(".json"):
        filepath = os.path.join(target_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                if "HHH" in content:
                    print(f"Found 'HHH' in {filename}")
                    # Try to parse to find exact field
                    try:
                        data = json.loads(content)
                        # Quick recursive search specifically for the value
                        def recursive_search(obj, path=""):
                            if isinstance(obj, dict):
                                for k, v in obj.items():
                                    recursive_search(v, f"{path}.{k}")
                            elif isinstance(obj, list):
                                for i, v in enumerate(obj):
                                    recursive_search(v, f"{path}[{i}]")
                            elif isinstance(obj, str):
                                if "HHH" in obj:
                                    print(f"  Field: {path}")
                                    print(f"  Value: {obj}")
                        
                        recursive_search(data)

                    except Exception as e:
                        print(f"  Error parsing JSON: {e}")
        except Exception as e:
            print(f"Error reading {filename}: {e}")
