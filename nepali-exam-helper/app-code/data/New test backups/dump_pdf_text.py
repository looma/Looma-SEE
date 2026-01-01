from pypdf import PdfReader

PDF_PATH = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\All Math Textbook.pdf"

def dump_text():
    reader = PdfReader(PDF_PATH)
    for i in range(10):
        print(f"--- Page {i+1} ---")
        print(reader.pages[i].extract_text())
        print("\n")

if __name__ == "__main__":
    dump_text()
