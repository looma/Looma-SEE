// Usage: node scripts/create-test-template.mjs --id see_2082_english --subject english --title "SEE 2082 English"
// Creates a template JSON file for a new test

import fs from "node:fs/promises"
import path from "node:path"

function parseArgs() {
  const argv = process.argv.slice(2)
  const args = {}
  
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--id" && argv[i + 1]) {
      args.id = argv[i + 1]
      i++
    } else if (argv[i] === "--subject" && argv[i + 1]) {
      args.subject = argv[i + 1]
      i++
    } else if (argv[i] === "--title" && argv[i + 1]) {
      args.title = argv[i + 1]
      i++
    } else if (argv[i] === "--nepali" && argv[i + 1]) {
      args.titleNepali = argv[i + 1]
      i++
    }
  }
  
  return args
}

function createTemplate(args) {
  const {
    id = "see_2082_new_test",
    subject = "general",
    title = "SEE 2082 New Test",
    titleNepali = "SEE २०८२ नयाँ परीक्षा"
  } = args

  return [
    {
      "_id": id,
      "title": title,
      "titleNepali": titleNepali,
      "subject": subject,
      "year": 2082,
      "totalMarks": 75,
      "duration": 180,
      "sections": ["A", "B", "C", "D"],
      "isActive": true,
      "createdAt": { "$date": new Date().toISOString() },
      "updatedAt": { "$date": new Date().toISOString() }
    },
    {
      "testId": id,
      "questions": {
        "groupA": [
          {
            "id": "1a",
            "type": "multiple_choice",
            "questionNepali": "यहाँ प्रश्न लेख्नुहोस्",
            "questionEnglish": "Write your question here",
            "options": [
              { "id": "i", "nepali": "विकल्प १", "english": "Option 1" },
              { "id": "ii", "nepali": "विकल्प २", "english": "Option 2" },
              { "id": "iii", "nepali": "विकल्प ३", "english": "Option 3" },
              { "id": "iv", "nepali": "विकल्प ४", "english": "Option 4" }
            ],
            "correctAnswer": "i",
            "marks": 1,
            "explanation": "Add explanation here"
          }
        ],
        "groupB": [
          {
            "id": "2a",
            "type": "short_answer",
            "questionNepali": "छोटो उत्तरको प्रश्न",
            "questionEnglish": "Short answer question",
            "marks": 1,
            "sampleAnswer": "Sample answer"
          }
        ],
        "groupC": [
          {
            "id": "3",
            "type": "long_answer",
            "questionNepali": "लामो उत्तरको प्रश्न",
            "questionEnglish": "Long answer question",
            "marks": 2,
            "sampleAnswer": "Detailed sample answer"
          }
        ],
        "groupD": [
          {
            "id": "17",
            "type": "essay",
            "questionNepali": "निबन्ध प्रकारको प्रश्न",
            "questionEnglish": "Essay type question",
            "marks": 4,
            "sampleAnswer": "Comprehensive essay answer"
          }
        ]
      }
    }
  ]
}

async function main() {
  const args = parseArgs()
  
  if (!args.id) {
    console.error("❌ Please provide --id parameter")
    console.log("Usage: node scripts/create-test-template.mjs --id see_2082_english --subject english --title 'SEE 2082 English'")
    process.exit(1)
  }
  
  const template = createTemplate(args)
  const filename = `${args.id}.json`
  const filepath = path.join("data", filename)
  
  // Ensure data directory exists
  await fs.mkdir("data", { recursive: true })
  
  // Write template file
  await fs.writeFile(filepath, JSON.stringify(template, null, 2))
  
  console.log(`✅ Created template: ${filepath}`)
  console.log(`📝 Edit the file to add your questions, then import with:`)
  console.log(`   node scripts/import-test-json.mjs --file ${filepath}`)
}

main().catch(console.error)
