// Quick script to import your data to port 27017
import { MongoClient } from "mongodb"
import fs from "node:fs/promises"

const uri = "mongodb://127.0.0.1:27017/see_exam_system"

// Your SEE 2081 test data
const testData = [
  {
    "_id": "see_2081_science_practice_full",
    "title": "SEE 2081 Science Comprehensive Practice Test",
    "titleNepali": "SEE २०८१ विज्ञान विस्तृत अभ्यास परीक्षा",
    "subject": "science",
    "year": 2081,
    "totalMarks": 75,
    "duration": 180,
    "sections": ["A", "B", "C", "D"],
    "isActive": true,
    "createdAt": new Date("2025-08-09T18:30:00.000Z"),
    "updatedAt": new Date()
  },
  {
    "testId": "see_2081_science_practice_full",
    "questions": {
      "groupA": [
        {
          "id": "A01",
          "type": "multiple_choice",
          "questionNepali": "तलका मध्ये कुनचाहिँ तत्त्जन्य एकाइ हो ?",
          "questionEnglish": "Which one of the following is a derived unit?",
          "options": [
            { "id": "i", "nepali": "क्याण्डेला (Candela)", "english": "Candela" },
            { "id": "ii", "nepali": "एम्पियर (Ampere)", "english": "Ampere" },
            { "id": "iii", "nepali": "न्युटन (Newton)", "english": "Newton" },
            { "id": "iv", "nepali": "मोल (Mole)", "english": "Mole" }
          ],
          "correctAnswer": "iii",
          "marks": 1
        },
        {
          "id": "A02",
          "type": "multiple_choice",
          "questionNepali": "सिअर्चिनलाई इकाइनोडर्माटा फाइलममा राखिनुको कारण के हो ?",
          "questionEnglish": "What is the reason of keeping sea-urchin in phylum echinodermata?",
          "options": [
            { "id": "i", "nepali": "शरीर, टाउको, छाती र पेटमा विभाजित भएकोले", "english": "Due to body being divided into head, thorax and abdomen" },
            { "id": "ii", "nepali": "ट्युव फिटको सहायताले चाल देखाउने भएकोले", "english": "Due to locomotion with the help of tube-feet" },
            { "id": "iii", "nepali": "शरीर टेपजस्तै पातलो, लामो र चेप्टो भएकोले", "english": "Due to body being flat and thin like a tape" },
            { "id": "iv", "nepali": "यिनीहरू ओसिलो माटो र पानीमा पाइने भएकोले", "english": "Due to them being found in moist soil and water" }
          ],
          "correctAnswer": "ii",
          "marks": 1
        },
        {
          "id": "A03",
          "type": "multiple_choice",
          "questionNepali": "रगतमा एक्कासी सेता रक्तकोषको कमि भएमा कुन रोग लाग्छ ?",
          "questionEnglish": "Which disease is caused due to the deficiency of white blood cells in blood suddenly?",
          "options": [
            { "id": "i", "nepali": "ल्युकोपेनिया (leukopenia)", "english": "leukopenia" },
            { "id": "ii", "nepali": "हेमोफिलिया (haemophilia)", "english": "haemophilia" },
            { "id": "iii", "nepali": "रक्तअल्पता (anemia)", "english": "anemia" },
            { "id": "iv", "nepali": "ल्युकेमिया (leukemia)", "english": "leukemia" }
          ],
          "correctAnswer": "i",
          "marks": 1
        }
      ],
      "groupB": [
        {
          "id": "B01",
          "type": "short_answer",
          "questionNepali": "अनलाइन रेप्युटेसन भनेको के हो ?",
          "questionEnglish": "What is online reputation?",
          "marks": 1
        },
        {
          "id": "B02",
          "type": "short_answer",
          "questionNepali": "शुद्ध रगत मुटुमा ल्याउने रक्तनलीको नाम के हो ?",
          "questionEnglish": "What is the name of blood vessel that brings pure blood to the heart?",
          "marks": 1
        }
      ],
      "groupC": [
        {
          "id": "C01",
          "type": "long_answer",
          "questionNepali": "आधारभूत एकाइको परिभाषा लेखी एउटा उदाहरण दिनुहोस् ।",
          "questionEnglish": "Define fundamental unit and give one example.",
          "marks": 2
        }
      ],
      "groupD": [
        {
          "id": "D01",
          "type": "essay",
          "questionNepali": "न्युटनको गुरुत्वाकर्षण सम्बन्धी विश्वव्यापी नियम लेख्नुहोस् र F = Gm₁m₂/d² भनी उपयुक्त चित्रसहित प्रमाणित गर्नुहोस् ।",
          "questionEnglish": "State Newton's Universal law of gravitation and prove that F = Gm₁m₂/d² with diagram.",
          "marks": 4
        }
      ]
    }
  }
]

async function switchTo27017() {
  console.log("🔄 Switching to MongoDB port 27017...")
  
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("✅ Connected to port 27017")
    
    const db = client.db("see_exam_system")
    
    // Clear existing data
    await db.collection("practice_tests").deleteMany({})
    await db.collection("questions").deleteMany({})
    console.log("🧹 Cleared existing data")
    
    // Import the test data
    const practiceTest = testData[0]
    const questions = testData[1]
    
    await db.collection("practice_tests").insertOne(practiceTest)
    await db.collection("questions").insertOne(questions)
    
    console.log("✅ Imported SEE 2081 test to port 27017")
    
    // Verify
    const testCount = await db.collection("practice_tests").countDocuments()
    const questionCount = await db.collection("questions").countDocuments()
    
    console.log(`📊 Database now has:`)
    console.log(`   Practice tests: ${testCount}`)
    console.log(`   Question sets: ${questionCount}`)
    
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

switchTo27017()
