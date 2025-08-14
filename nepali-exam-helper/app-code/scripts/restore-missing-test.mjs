// This will restore the SEE 2081 test that was lost
import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:47017/see_exam_system"

const see2081TestData = {
  practiceTest: {
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
  questions: {
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
          "marks": 1,
          "explanation": "Newton (unit of force) is a derived unit (kg·m/s²). Candela, Ampere, and Mole are fundamental units."
        },
        {
          "id": "A02",
          "type": "multiple_choice",
          "questionNepali": "सिअर्चिनलाई इकाइनोडर्माटा फाइलममा राखिनुको कारण के हो ?",
          "questionEnglish": "What is the reason of keeping sea-urchin in phylum echinodermata?",
          "options": [
            {
              "id": "i",
              "nepali": "शरीर, टाउको, छाती र पेटमा विभाजित भएकोले",
              "english": "Due to body being divided into head, thorax and abdomen"
            },
            {
              "id": "ii",
              "nepali": "ट्युव फिटको सहायताले चाल देखाउने भएकोले",
              "english": "Due to locomotion with the help of tube-feet"
            },
            {
              "id": "iii",
              "nepali": "शरीर टेपजस्तै पातलो, लामो र चेप्टो भएकोले",
              "english": "Due to body being flat and thin like a tape"
            },
            {
              "id": "iv",
              "nepali": "यिनीहरू ओसिलो माटो र पानीमा पाइने भएकोले",
              "english": "Due to them being found in moist soil and water"
            }
          ],
          "correctAnswer": "ii",
          "marks": 1,
          "explanation": "A key characteristic of Phylum Echinodermata is the presence of a water vascular system with tube feet used for locomotion."
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
          "marks": 1,
          "explanation": "Leukopenia is the medical term for a low white blood cell count."
        }
      ],
      "groupB": [
        {
          "id": "B01",
          "type": "short_answer",
          "questionNepali": "अनलाइन रेप्युटेसन भनेको के हो ?",
          "questionEnglish": "What is online reputation?",
          "marks": 1,
          "sampleAnswer": "Online reputation is the collective perception of an individual or organization based on their digital presence and activities on the internet."
        },
        {
          "id": "B02",
          "type": "short_answer",
          "questionNepali": "शुद्ध रगत मुटुमा ल्याउने रक्तनलीको नाम के हो ?",
          "questionEnglish": "What is the name of blood vessel that brings pure blood to the heart?",
          "marks": 1,
          "sampleAnswer": "Pulmonary vein (पल्मोनरी भेन)."
        }
      ],
      "groupC": [
        {
          "id": "C01",
          "type": "long_answer",
          "questionNepali": "आधारभूत एकाइको परिभाषा लेखी एउटा उदाहरण दिनुहोस् ।",
          "questionEnglish": "Define fundamental unit and give one example.",
          "marks": 2,
          "sampleAnswer": "A fundamental unit is a basic unit of measurement that is independent of other units and from which other (derived) units are formed. Example: kilogram (kg)."
        }
      ],
      "groupD": [
        {
          "id": "D01",
          "type": "essay",
          "questionNepali": "न्युटनको गुरुत्वाकर्षण सम्बन्धी विश्वव्यापी नियम लेख्नुहोस् र F = Gm₁m₂/d² भनी उपयुक्त चित्रसहित प्रमाणित गर्नुहोस् ।",
          "questionEnglish": "State Newton's Universal law of gravitation and prove that F = Gm₁m₂/d² with diagram.",
          "marks": 4,
          "sampleAnswer": "F ∝ m₁m₂ and F ∝ 1/d² → F = G m₁m₂/d²."
        }
      ]
    }
  }
}

async function restoreMissingTest() {
  const client = new MongoClient(uri)
  try {
    console.log("🔄 Restoring SEE 2081 test to port 47017...")
    await client.connect()
    
    const db = client.db("see_exam_system")
    const practiceTests = db.collection("practice_tests")
    const questions = db.collection("questions")
    
    // Insert practice test
    await practiceTests.updateOne(
      { _id: see2081TestData.practiceTest._id },
      { $set: see2081TestData.practiceTest },
      { upsert: true }
    )
    console.log("✅ Restored practice test: see_2081_science_practice_full")
    
    // Insert questions
    await questions.updateOne(
      { testId: see2081TestData.questions.testId },
      { $set: see2081TestData.questions },
      { upsert: true }
    )
    console.log("✅ Restored questions for: see_2081_science_practice_full")
    
    // Verify restoration
    const testCount = await practiceTests.countDocuments()
    const questionCount = await questions.countDocuments()
    
    console.log(`\n📊 Current database status:`)
    console.log(`   Practice Tests: ${testCount}`)
    console.log(`   Question Sets: ${questionCount}`)
    
    console.log("\n🎉 SEE 2081 test restored successfully!")
    
  } catch (error) {
    console.error("❌ Restoration failed:", error)
  } finally {
    await client.close()
  }
}

restoreMissingTest()
