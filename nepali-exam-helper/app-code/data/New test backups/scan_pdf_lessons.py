from pypdf import PdfReader
import re

PDF_PATH = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\All Math Textbook.pdf"

def scan_lessons():
    reader = PdfReader(PDF_PATH)
    print("Mapping Lessons...")
    found_lessons = {}
    
    # Scan deeper for lessons 12-16
    for i in range(100, min(300, len(reader.pages))):
        try:
            text = reader.pages[i].extract_text()
            lines = text.split('\n')
            for j, line in enumerate(lines):
                 if "Lesson" in line:
                    match = re.search(r'Lesson\s+(\d+)', line)
                    if match:
                        num = int(match.group(1))
                        if num not in found_lessons:
                            # Capture surrounding context
                            context = " ".join(lines[max(0, j-1):min(len(lines), j+2)])
                            s_context = context.encode('ascii', 'ignore').decode('ascii')
                            print(f"[Page {i+1}] Found Lesson {num}: {s_context}")
                            found_lessons[num] = s_context
                            
        except Exception:
            pass
            
if __name__ == "__main__":
    scan_lessons()
