import json
import os

filepath = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_4.json"

def fix_logic():
    print("Fixing logic in Math Exam 4...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    questions = data[1]["questions"]
    
    # --- Fix Q10 (Mix of Surds and Indices) ---
    # Current Context: Simplify Surd
    # Q10a: (empty/generic) -> needs the Surd problem
    # Q10b: Indices problem
    q10 = questions[9]
    original_surd_context_en = "Simplify: \\sqrt[3]{27 a^6 b^3}"
    original_surd_context_ne = "सरल गर्नुहोस्: \\sqrt[3]{27 a^6 b^3}"
    
    # Update Context to be generic
    q10["context"]["English"] = "Solve the following problems."
    q10["context"]["Nepali"] = "तलका समस्याहरू हल गर्नुहोस् ।"
    
    # Update Q10a to have the Surd problem
    if len(q10["sub_questions"]) >= 1:
        qa = q10["sub_questions"][0]
        # Only update if it doesn't have the question yet
        if not qa.get("questionEnglish"):
            qa["questionEnglish"] = original_surd_context_en
            qa["questionNepali"] = original_surd_context_ne
            print("  Q10: Moved Surd problem to subquestion (a).")

    # --- Fix Q12 (Drawing Task) ---
    # Q12b: Experimentally verify -> Drawing.
    # Replace with Calculation.
    q12 = questions[11]
    if len(q12["sub_questions"]) >= 2:
        qb = q12["sub_questions"][1]
        if "experimentally" in qb.get("questionEnglish", "").lower() or "verify" in qb.get("questionEnglish", "").lower():
            # New Question: Find angles using algebra
            qb["questionNepali"] = "यदि $\\angle Q = 2y$ र $\\angle S = 3y - 20$ भए y को मान पत्ता लगाउनुहोस् ।"
            qb["questionEnglish"] = "If $\\angle Q = 2y$ and $\\angle S = 3y - 20$, find the value of y."
            qb["answerNepali"] = "४०"
            qb["answerEnglish"] = "40"
            qb["explanationNepali"] = "सम्मुख कोणहरूको योग $180^\\circ$ हुन्छ। $2y + 3y - 20 = 180 \\Rightarrow 5y = 200 \\Rightarrow y = 40$।"
            qb["explanationEnglish"] = "Sum of opposite angles is $180^\\circ$. $2y + 3y - 20 = 180 \\Rightarrow 5y = 200 \\Rightarrow y = 40$."
            print("  Q12: Replaced experimental verification with algebraic calculation.")

    # --- Fix Q16 (Dice vs Coins) ---
    # Context: Dice
    # a: Dice
    # b, c: Coins
    # Action: Convert Context and (a) to Coins.
    q16 = questions[15]
    
    q16["context"]["English"] = "Two coins are tossed simultaneously."
    q16["context"]["Nepali"] = "दुईवटा सिक्का एकैसाथ उचालिएका छन् ।"
    
    if len(q16["sub_questions"]) >= 1:
        qa = q16["sub_questions"][0]
        # Original (a) was about Dice (<4). Change to Sample Space.
        qa["questionNepali"] = "सम्भावित नमुना क्षेत्र (Sample Space) लेख्नुहोस् ।"
        qa["questionEnglish"] = "Write the possible sample space."
        qa["answerNepali"] = "{HH, HT, TH, TT}"
        qa["answerEnglish"] = "{HH, HT, TH, TT}"
        qa["explanationNepali"] = "दुई सिक्का उचाल्दा: HH, HT, TH, TT."
        qa["explanationEnglish"] = "Tossing two coins: HH, HT, TH, TT."
        print("  Q16: Updated context and part (a) to 'Coins'.")

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
if __name__ == "__main__":
    fix_logic()
