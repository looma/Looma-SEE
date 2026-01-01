import sys
import os

PDF_PATH = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\All Math Textbook.pdf"

def extract_text():
    # Try pypdf
    try:
        from pypdf import PdfReader
        print("Using pypdf...")
        reader = PdfReader(PDF_PATH)
        text = ""
        # Check first few pages
        for i in range(min(3, len(reader.pages))):
            text += reader.pages[i].extract_text() + " "
        return text
    except ImportError:
        pass
        
    # Try PyPDF2
    try:
        import PyPDF2
        print("Using PyPDF2...")
        with open(PDF_PATH, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for i in range(min(3, len(reader.pages))):
                text += reader.pages[i].extract_text() + " "
            return text
    except ImportError:
        pass
        
    print("Error: neither pypdf nor PyPDF2 installed.")
    return None

def main():
    if not os.path.exists(PDF_PATH):
        print("PDF Not Found.")
        return

    text = extract_text()
    if text:
        # Split by whitespace to get words
        words = text.split()
        print(f"First 10 words: {words[:10]}")
    else:
        print("Could not read PDF text.")

if __name__ == "__main__":
    main()
