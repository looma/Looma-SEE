import json
import os

filepath = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups\see_2081_math_practice_4.json"

# New subquestions to add. 
# Key: Question Index (0-based)
# Value: List of subquestion dicts to append
ADDITIONS = {
    0: [ # Q1 (Needs 5 more marks, Total 6. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "माथिको जानकारीलाई भेन चित्रमा प्रस्तुत गर्नुहोस् ।",
            "questionEnglish": "Represent the above information in a Venn diagram.",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "भेन चित्र", "answerEnglish": "Venn diagram",
            "explanationNepali": "भेन चित्रमा सबै समूहहरूको प्रतिच्छेदन र फरक देखाउनुहोस्।",
            "explanationEnglish": "Show the intersection and difference of all sets in the Venn diagram."
        },
        {
            "labelNepali": "ग", "labelEnglish": "c",
            "questionNepali": "स्याउ मात्र मन पराउने मानिसहरूको प्रतिशत पत्ता लगाउनुहोस् ।",
            "questionEnglish": "Find the percentage of people who like apples only.",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "३०%", "answerEnglish": "30%",
            "explanationNepali": "स्याउ मात्र = ५०% - २०% = ३०%।",
            "explanationEnglish": "Apple only = 50% - 20% = 30%."
        },
        {
            "labelNepali": "घ", "labelEnglish": "d",
            "questionNepali": "कम्तिमा एउटा फल मन पराउने प्रतिशत कति छ?",
            "questionEnglish": "What is the percentage of people who like at least one fruit?",
            "marksNepali": "१", "marksEnglish": 1,
            "answerNepali": "९०%", "answerEnglish": "90%",
            "explanationNepali": "योगफल = ६० + ५० - २० = ९०%।",
            "explanationEnglish": "Union = 60 + 50 - 20 = 90%."
        }
    ],
    1: [ # Q2 (Needs 3 more marks, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "उक्त समयको अन्त्यमा चक्रीय मिश्रधन कति हुन्छ?",
            "questionEnglish": "What will be the compound amount at the end of that time?",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "रु. १२,१००", "answerEnglish": "Rs. 12,100",
            "explanationNepali": "CA = १००००(१.१)^२ = १२१००।",
            "explanationEnglish": "CA = 10000(1.1)^2 = 12100."
        }
    ],
    2: [ # Q3 (Needs 3 more marks, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "२ वर्षमा हुने कुल ह्रास रकम पत्ता लगाउनुहोस् ।",
            "questionEnglish": "Find the total depreciation amount in 2 years.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "रु. १४,४००", "answerEnglish": "Rs. 14,400",
            "explanationNepali": "ह्रास = ४०००० - २५६०० = १४४००।",
            "explanationEnglish": "Depreciation = 40000 - 25600 = 14400."
        }
    ],
    3: [ # Q4 (Needs 4 more marks, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "अवमूल्यन पछि नयाँ विनिमय दर कति हुन्छ?",
            "questionEnglish": "What is the new exchange rate after devaluation?",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "१४५.२", "answerEnglish": "145.2",
            "explanationNepali": "१३२ + १०% = १४५.२।",
            "explanationEnglish": "132 + 10% = 145.2."
        },
        {
            "labelNepali": "ग", "labelEnglish": "c",
            "questionNepali": "यदि उसले सो डलर साट्दा कति नेपाली रुपैयाँ पाउँछ?",
            "questionEnglish": "How much Nepali rupees will he get if he exchanges that dollar?",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "रु. २,२०,०००", "answerEnglish": "Rs. 2,20,000",
            "explanationNepali": "१५१५.१५ * १४५.२ = २२००००।",
            "explanationEnglish": "1515.15 * 145.2 = 220000."
        }
    ],
     4: [ # Q5 (Needs 3 more, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "यदि आधारको परिमिति २० से.मि. छ भने, पूरा सतहको क्षेत्रफल पत्ता लगाउनुहोस् ।",
            "questionEnglish": "If the perimeter of the base is 20 cm, find the total surface area.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "३४८ वर्ग से.मि.", "answerEnglish": "348 sq. cm",
            "explanationNepali": "TSA = Ph + 2A = 20*15 + 2*24 = 300 + 48 = 348.",
            "explanationEnglish": "TSA = Ph + 2A = 20*15 + 2*24 = 300 + 48 = 348."
        }
    ],
    5: [ # Q6 (Needs 4 more, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "यदि अर्धव्यास ७ से.मि. र उचाइ १० से.मि. छ भने बेलनाको आयतन निकाल्नुहोस् ।",
            "questionEnglish": "If radius is 7 cm and height is 10 cm, find volume of cylinder.",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "१५४०", "answerEnglish": "1540",
            "explanationNepali": "V = pi * r^2 * h = 22/7 * 49 * 10 = 1540.",
            "explanationEnglish": "V = pi * r^2 * h = 22/7 * 49 * 10 = 1540."
        },
        {
            "labelNepali": "ग", "labelEnglish": "c",
            "questionNepali": "सोलीको आयतन निकाल्नुहोस् ।",
            "questionEnglish": "Find volume of cone.",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "५१३.३३", "answerEnglish": "513.33",
            "explanationNepali": "V = 1/3 * 1540 = 513.33.",
            "explanationEnglish": "V = 1/3 * 1540 = 513.33."
        }
    ],
    6: [ # Q7 (Needs 3 more, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "प्रति वर्ग मिटर रु. ५०० को दरले बाटोमा इँटा छाप्न कति खर्च लाग्छ?",
            "questionEnglish": "Find the cost of paving the path at Rs. 500 per sq m.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "रु. १,६८,०००", "answerEnglish": "Rs. 1,68,000",
            "explanationNepali": "Cost = 336 * 500 = 168000.",
            "explanationEnglish": "Cost = 336 * 500 = 168000."
        }
    ],
    7: [ # Q8 (Needs 4 more, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "पहिलो २० जोर संख्याहरूको योगफल पत्ता लगाउनुहोस् ।",
            "questionEnglish": "Find the sum of the first 20 even numbers.",
            "marksNepali": "४", "marksEnglish": 4,
            "answerNepali": "४२०", "answerEnglish": "420",
            "explanationNepali": "Sum = n(n+1) = 20(21) = 420.",
            "explanationEnglish": "Sum = n(n+1) = 20(21) = 420."
        }
    ],
    8: [ # Q9 (Needs 4 more, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "समीकरण ३x + ४y = १८ लाई सन्तुष्ट गर्छ कि गर्दैन जाँच गर्नुहोस् ।",
            "questionEnglish": "Check if it satisfies equation 3x + 4y = 18.",
            "marksNepali": "४", "marksEnglish": 4,
            "answerNepali": "गर्छ", "answerEnglish": "Yes",
            "explanationNepali": "३(२) + ४(३) = ६ + १२ = १८।",
            "explanationEnglish": "3(2) + 4(3) = 6 + 12 = 18."
        }
    ],
    9: [ # Q10 (Needs 4 more, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "हल गर्नुहोस्: २^x + २^(x+1) = २४",
            "questionEnglish": "Solve: 2^x + 2^(x+1) = 24",
            "marksNepali": "४", "marksEnglish": 4,
            "answerNepali": "३", "answerEnglish": "3",
            "explanationNepali": "2^x (1+2) = 24 -> 2^x = 8 -> x = 3.",
            "explanationEnglish": "2^x (1+2) = 24 -> 2^x = 8 -> x = 3."
        }
    ],
    10: [ # Q11 (Needs 3 more, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "उक्त सम्बन्धलाई चित्रद्वारा प्रमाणित गर्नुहोस् ।",
            "questionEnglish": "Verify the relationship diagrammatically.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "प्रमाणित", "answerEnglish": "Verified",
            "explanationNepali": "चित्र बनाएर देखाउनुहोस्।",
            "explanationEnglish": "Show by drawing figure."
        }
    ],
    11: [ # Q12 (Needs 4 more, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "चक्रीय चतुर्भुजका सम्मुख कोणहरूको योग १८० डिग्री हुन्छ भनी प्रयोगद्वारा सिद्ध गर्नुहोस् ।",
            "questionEnglish": "Experimentally verify that sum of opposite angles of cyclic quadrilateral is 180 degrees.",
            "marksNepali": "४", "marksEnglish": 4,
            "answerNepali": "सिद्ध", "answerEnglish": "Proved",
            "explanationNepali": "दुईवटा वृत्त बनाएर नाप्नुहोस्।",
            "explanationEnglish": "Draw two circles and measure."
        }
    ],
    12: [ # Q13 (Needs 3 more, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "यदि सानाे त्रिभुजको क्षेत्रफल ६४ छ भने ठूलोको कति हुन्छ?",
            "questionEnglish": "If area of smaller is 64, find area of larger.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "१००", "answerEnglish": "100",
            "explanationNepali": "64/A = 16/25 -> A = 100.",
            "explanationEnglish": "64/A = 16/25 -> A = 100."
        }
    ],
    13: [ # Q14 (Needs 3 more, Total 4. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "मध्यकको प्रयोग गरेर अज्ञात बारम्बारता पत्ता लगाउनुहोस्।",
            "questionEnglish": "Find unknown frequency using mean.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "५", "answerEnglish": "5",
            "explanationNepali": "सूत्र प्रयोग गर्नुहोस्।",
            "explanationEnglish": "Use formula."
        }
    ],
    14: [ # Q15 (Needs 5 more, Total 6. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "मध्यिका पत्ता लगाउनुहोस् ।",
            "questionEnglish": "Calculate the median.",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "३०", "answerEnglish": "30",
            "explanationNepali": "L + ... सूत्र।",
            "explanationEnglish": "Use L + ... formula."
        },
        {
            "labelNepali": "ग", "labelEnglish": "c",
            "questionNepali": "तृतीय चतुर्थांश पत्ता लगाउनुहोस् ।",
            "questionEnglish": "Calculate the third quartile.",
            "marksNepali": "३", "marksEnglish": 3,
            "answerNepali": "४५", "answerEnglish": "45",
            "explanationNepali": "3N/4 पद।",
            "explanationEnglish": "3N/4 item."
        }
    ],
    15: [ # Q16 (Needs 4 more, Total 5. Existing: 1)
        {
            "labelNepali": "ख", "labelEnglish": "b",
            "questionNepali": "दुईवटा सिक्का उचाल्दा दुवैमा Head आउने सम्भाव्यता कति हुन्छ?",
            "questionEnglish": "What is probability of getting Head on both when two coins are tossed?",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "१/४", "answerEnglish": "1/4",
            "explanationNepali": "HH, HT, TH, TT. 1/4.",
            "explanationEnglish": "HH, HT, TH, TT. 1/4."
        },
        {
            "labelNepali": "ग", "labelEnglish": "c",
            "questionNepali": "रुख चित्र बनाउनुहोस् ।",
            "questionEnglish": "Draw a tree diagram.",
            "marksNepali": "२", "marksEnglish": 2,
            "answerNepali": "रुख चित्र", "answerEnglish": "Tree diagram",
            "explanationNepali": "शाखाहरू देखाउनुहोस्।",
            "explanationEnglish": "Show branches."
        }
    ]
}

def main():
    print("Fixing Math Exam 4...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    questions = data[1]["questions"]
    
    for idx, question in enumerate(questions):
        if idx in ADDITIONS:
            # Check current subquestions
            existing_subs = question.get("sub_questions", [])
            
            # Append new ones
            new_subs = ADDITIONS[idx]
            existing_subs.extend(new_subs)
            
            question["sub_questions"] = existing_subs
            print(f"Expanded Q{idx+1} with {len(new_subs)} subquestions.")
            
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print("Done.")

if __name__ == "__main__":
    main()
