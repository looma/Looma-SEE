import json
import os
import shutil

# Key Mappings
KEY_MAP = {
    "word": "शब्द",
    "pos": "पदवर्ग",
    "term": "शब्द",
    "sentence": "वाक्य",
    "formation": "निर्माण_प्रक्रिया",
    "split": "विग्रह",
    "phrase": "विग्रह",
    "compound": "समस्त_शब्द"
}

def translate_keys(data):
    if isinstance(data, dict):
        new_data = {}
        for k, v in data.items():
            new_key = KEY_MAP.get(k, k)
            new_data[new_key] = translate_keys(v)
        return new_data
    elif isinstance(data, list):
        return [translate_keys(item) for item in data]
    else:
        return data

def process_question(q):
    # Process sampleAnswerNepali
    if 'sampleAnswerNepali' in q:
        q['sampleAnswerNepali'] = translate_keys(q['sampleAnswerNepali'])
    
    # Process correctAnswerNepali
    if 'correctAnswerNepali' in q:
        q['correctAnswerNepali'] = translate_keys(q['correctAnswerNepali'])
        
    # Recurse for subQuestions
    if 'subQuestions' in q:
        for sub_q in q['subQuestions']:
            process_question(sub_q)

def process_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding {filepath}")
            return

    # Root can be a list
    if isinstance(data, list):
        root = data
    else:
        root = [data]

    for item in root:
        if 'questions' in item:
            for q in item['questions']:
                process_question(q)

    # Backup original
    shutil.copy(filepath, filepath + ".bak")
    
    # Save modified
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {filepath}")

files = [
    "see_2081_nepali_practice_1_generated.json",
    "see_2081_nepali_practice_2_generated.json",
    "see_2081_nepali_practice_3_generated.json",
    "see_2081_nepali_practice_4_generated.json",
    "see_2081_nepali_practice_5_generated.json"
]

dir_path = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data"

for filename in files:
    path = os.path.join(dir_path, filename)
    if os.path.exists(path):
        process_file(path)
