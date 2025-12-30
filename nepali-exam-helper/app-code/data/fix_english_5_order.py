
import json
import os
from collections import OrderedDict

def fix_english_5_order():
    file_path = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\see_2081_english_practice_5_generated.json"
    
    if not os.path.exists(file_path):
        print("File not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Function to recursively process and reorder
    def reorder_node(node):
        if isinstance(node, list):
            return [reorder_node(item) for item in node]
        elif isinstance(node, dict):
            new_node = OrderedDict()
            keys = list(node.keys())
            
            # Check if this node has optionsEnglish and optionsNepali
            has_opts_en = "optionsEnglish" in keys
            has_opts_np = "optionsNepali" in keys
            
            for key in keys:
                # If we hit optionsEnglish, and we have optionsNepali, skip it for now
                if key == "optionsEnglish" and has_opts_np:
                    continue
                
                # If we hit optionsNepali, write optionsNepali THEN optionsEnglish
                if key == "optionsNepali":
                    new_node["optionsNepali"] = node["optionsNepali"]
                    if has_opts_en:
                        new_node["optionsEnglish"] = node["optionsEnglish"]
                    continue
                
                # Proceed normally
                new_node[key] = reorder_node(node[key])
            
            # Catch edge case where optionsEnglish was present but optionsNepali wasn't (orphaned?)
            # Logic above handles the pair. If only English exists, it writes normally.
            
            return new_node
        else:
            return node

    # Apply reordering
    data = reorder_node(data)

    # Write back
    temp_path = file_path + ".tmp"
    with open(temp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(temp_path, file_path)
    print("Reordered options in English Practice 5.")

if __name__ == "__main__":
    fix_english_5_order()
