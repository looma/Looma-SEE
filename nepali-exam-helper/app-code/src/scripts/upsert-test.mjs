// Usage examples:
//   node src/scripts/upsert-test.mjs --id see_2079_science --title "SEE 2079 Science Practice Test" --titleNepali "SEE २०७९ विज्ञान अभ्यास परीक्षा" --subject science --year 2079 --totalMarks 75
//   node src/scripts/upsert-test.mjs --id see_2079_science --questions src/scripts/templates/sample-test-questions.json
//
// You can run both at once to upsert the practice test metadata and questions:
//   node src/scripts/upsert-test.mjs --id see_2079_science --title "SEE 2079 Science Practice Test" --titleNepali "SEE २०७९ विज्ञान अभ्यास परीक्षा" --subject science --year 2079 --totalMarks 75 --questions src/scripts/templates/sample-test-questions.json

import { MongoClient } from "mongodb"
import fs from "fs"
import path from "path"
import url from "url"

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Config: uses your local MongoDB on port 47017
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:47017"
const MONGODB_DB = process.env.MONGODB_DB || "see_exam_system"

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") out.help = true
    else if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith("--")) {
        out[key] = true
      } else {
        out[key] = next
        i++
      }
    }
  }
  return out
}

function printHelp() {
  console.log(`
Upsert a SEE practice test and its questions.

Required:
  --id <testId>                    e.g. see_2079_science

Optional (practice_tests metadata):
  --title <string>                 e.g. "SEE 2079 Science Practice Test"
  --titleNepali <string>           e.g. "SEE २०७९ विज्ञान अभ्यास परीक्षा"
  --subject <string>               e.g. science | math | english
  --year <number>                  e.g. 2079
  --totalMarks <number>            e.g. 75
  --active <true|false>            default: true

Questions JSON:
  --questions <path>               path to JSON file with groups A, B, C, D

Examples:
  node src/scripts/upsert-test.mjs --id see_2079_science --title "SEE 2079 Science Practice Test" --titleNepali "SEE २०७९ विज्ञान अभ्यास परीक्षा" --subject science --year 2079 --totalMarks 75
  node src/scripts/upsert-test.mjs --id see_2079_science --questions src/scripts/templates/sample-test-questions.json
  node src/scripts/upsert-test.mjs --id see_2079_science --title "SEE 2079 Science Practice Test" --titleNepali "SEE २०७९ विज्ञान अभ्यास परीक्षा" --subject science --year 2079 --totalMarks 75 --questions src/scripts/templates/sample-test-questions.json
`)
}

function ensureNumber(val, fallback) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help || !args.id) {
    printHelp()
    process.exit(args.id ? 0 : 1)
  }

  const testId = String(args.id)
  const title = args.title
  const titleNepali = args.titleNepali
  const subject = args.subject
  const year = ensureNumber(args.year, undefined)
  const totalMarks = ensureNumber(args.totalMarks, undefined)
  const isActive = args.active !== undefined ? args.active === "true" || args.active === true : true

  let questionsPayload = null
  if (args.questions) {
    const questionsPath = path.isAbsolute(args.questions)
      ? args.questions
      : path.join(process.cwd(), args.questions)
    if (!fs.existsSync(questionsPath)) {
      console.error("Questions file not found:", questionsPath)
      process.exit(1)
    }
    const raw = fs.readFileSync(questionsPath, "utf-8")
    try {
      const parsed = JSON.parse(raw)
      // Minimal shape validation
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid JSON structure")
      }
      questionsPayload = {
        groupA: Array.isArray(parsed.groupA) ? parsed.groupA : [],
        groupB: Array.isArray(parsed.groupB) ? parsed.groupB : [],
        groupC: Array.isArray(parsed.groupC) ? parsed.groupC : [],
        groupD: Array.isArray(parsed.groupD) ? parsed.groupD : [],
      }
    } catch (e) {
      console.error("Failed to parse questions JSON:", e.message)
      process.exit(1)
    }
  }

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB:", MONGODB_URI)
    const db = client.db(MONGODB_DB)

    const practiceTests = db.collection("practice_tests")
    const questions = db.collection("questions")

    // Upsert practice_tests metadata if provided
    if (title || titleNepali || subject || year || totalMarks || args.active !== undefined) {
      const metaDoc = {
        _id: testId,
        title: title ?? `Practice Test ${testId}`,
        titleNepali: titleNepali ?? `अभ्यास परीक्षा ${testId}`,
        subject: subject ?? "science",
        year: year ?? 2080,
        totalMarks: totalMarks ?? 75,
        sections: ["A", "B", "C", "D"],
        isActive,
        updatedAt: new Date(),
      }
      // Preserve createdAt if exists
      const existing = await practiceTests.findOne({ _id: testId })
      if (existing?.createdAt) metaDoc.createdAt = existing.createdAt
      else metaDoc.createdAt = new Date()

      await practiceTests.updateOne(
        { _id: testId },
        { $set: metaDoc },
        { upsert: true },
      )
      console.log("✅ Upserted practice_tests doc:", testId)
    }

    // Upsert questions doc if provided
    if (questionsPayload) {
      // Transform is already aligned with your API route (questionNepali, questionEnglish)
      await questions.updateOne(
        { testId },
        {
          $set: {
            testId,
            questions: questionsPayload,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      )
      console.log("✅ Upserted questions doc for:", testId)
    }

    console.log("🎉 Done.")
  } catch (err) {
    console.error("Error:", err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
