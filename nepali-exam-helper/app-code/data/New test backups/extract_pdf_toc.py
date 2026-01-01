from pypdf import PdfReader
import re

PDF_PATH = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\All Math Textbook.pdf"

def extract_toc():
    try:
        reader = PdfReader(PDF_PATH)
        print(f"Total Pages: {len(reader.pages)}")
        
        # Scan first 20 pages for TOC
        full_text = ""
        for i in range(min(20, len(reader.pages))):
            full_text += reader.pages[i].extract_text() + "\n"
            
        # Look for patterns like "Lesson 1", "Unit 1", "Chapter 1"
        # Regex for "Lesson <number> <Title>"
        matches = re.findall(r"(?:Lesson|Unit)\s+(\d+)\s+([A-Za-z\s]+)", full_text, re.IGNORECASE)
        
        print("\nPossible Lesson Mappings found in TOC:")
        seen = set()
        for num, title in matches:
            clean_title = title.strip().split('\n')[0]
            if num not in seen:
                print(f"Lesson {num}: {clean_title}")
                seen.add(num)
                
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    extract_toc()
