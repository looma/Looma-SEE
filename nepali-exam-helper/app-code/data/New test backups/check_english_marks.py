import json
import os

DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def get_marks(question):
    # Try marksEnglish first (usually an integer)
    if "marksEnglish" in question:
        return question["marksEnglish"]
    # Then try marks
    if "marks" in question:
        val = question["marks"]
        if isinstance(val, (int, float)):
            return val
        # If it's a string, try to convert? usually marks are ints in English exams
        try:
            return float(val)
        except:
            pass
    return 0

def check_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        return

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Standard structure: root list -> [header, {matchId..., questions:[]}]
        # Or sometimes just a dict? The English exams are usually lists.
        
        questions = []
        if isinstance(data, list):
            for item in data:
                if "questions" in item:
                    questions = item["questions"]
                    break
        elif isinstance(data, dict) and "questions" in data:
             questions = data["questions"]
             
        if not questions:
            print(f"{filename}: No questions found.")
            return

        total_marks = 0
        for q in questions:
            m = get_marks(q)
            total_marks += m
            
        status = "MATCH" if total_marks == 75 else "MISMATCH"
        print(f"{filename}: Total Marks = {total_marks} [{status}]")

    except Exception as e:
        print(f"Error processing {filename}: {e}")

def main():
    print("Checking English Exam Marks...")
    for i in range(1, 6):
        filename = f"see_2081_english_practice_{i}_generated.json"
        check_file(filename)

if __name__ == "__main__":
    main()
