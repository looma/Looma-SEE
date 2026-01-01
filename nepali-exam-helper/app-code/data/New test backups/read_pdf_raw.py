import re

PDF_PATH = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\All Math Textbook.pdf"

def main():
    try:
        with open(PDF_PATH, "rb") as f:
            content = f.read(20000) # Read first 20KB
            
        # Regex to find strings of length 3+
        # This picks up metadata keys like "Catalog", "Pages", etc.
        # But maybe the title.
        words = re.findall(b"[a-zA-Z]{2,}", content)
        decoded = [w.decode('ascii', errors='ignore') for w in words]
        
        print(f"First 20 raw strings found: {decoded[:20]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
