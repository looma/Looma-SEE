import sys
import json
import os
import glob
import re

# Set stdout to utf-8 safely for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

def audit_citations():
    pattern = os.path.join(directory, "see_2081_*.json")
    files = glob.glob(pattern)
    
    print(f"Found {len(files)} files to audit.\n")
    
    results = {}

    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Find the exam object (it's usually in a list)
            exam_data = data
            
            total_questions = 0
            questions_with_citations = 0
            questions_without_citations = 0
            
            # Recursive function to find questions
            def traverse_and_check(node):
                nonlocal total_questions, questions_with_citations, questions_without_citations
                
                if isinstance(node, dict):
                    # Check if this node looks like a question with an explanation
                    # We look for explicit explanation fields
                    has_explanation = 'explanationEnglish' in node or 'explanationNepali' in node
                    
                    if has_explanation:
                        total_questions += 1
                        
                        has_citation = False
                        expl_en = node.get('explanationEnglish', '')
                        expl_ne = node.get('explanationNepali', '')
                        
                        # Check for various citation markers
                        markers = ['Citation', 'Uddharan', 'उद्धरण', 'citation']
                        if (isinstance(expl_en, str) and any(m in expl_en for m in markers)) or \
                           (isinstance(expl_ne, str) and any(m in expl_ne for m in markers)):
                            has_citation = True
                        
                        # Also check the "Citations" field if it exists (some older files might use it?)
                        # But user asked about citations IN answer/explanation
                        
                        if has_citation:
                            questions_with_citations += 1
                        else:
                            questions_without_citations += 1
                            # Try to identify the question
                            q_id = node.get('questionNumberEnglish', node.get('idEnglish', node.get('questionNumberNepali', 'Unknown')))
                            print(f"  [MISSING] {filename} - Q: {q_id}")
                    
                    # Recurse into values
                    for value in node.values():
                        traverse_and_check(value)
                        
                elif isinstance(node, list):
                    # Recurse into items
                    for item in node:
                        traverse_and_check(item)

            traverse_and_check(exam_data)

            results[filename] = {
                'total': total_questions,
                'with': questions_with_citations,
                'without': questions_without_citations
            }
            
            status = "OK" if questions_without_citations == 0 and total_questions > 0 else "MISSING"
            if total_questions == 0:
                status = "NO QUESTIONS FOUND"
            
            print(f"[{status}] {filename}: {questions_with_citations}/{total_questions} have citations.")

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

    print("\n--- Summary Not Fully Citated ---")
    for filename, stats in results.items():
        if stats['without'] > 0:
            print(f"{filename}: Missing {stats['without']} citations out of {stats['total']}")

if __name__ == "__main__":
    audit_citations()
