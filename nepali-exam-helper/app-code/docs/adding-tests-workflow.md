# Complete Workflow for Adding New Tests

## Method 1: Using JSON Import (Recommended)

### Step 1: Create Test JSON File
Create a file like `data/my-new-test.json`:

\`\`\`json
[
  {
    "_id": "see_2082_math",
    "title": "SEE 2082 Mathematics Practice Test",
    "titleNepali": "SEE २०८२ गणित अभ्यास परीक्षा",
    "subject": "mathematics",
    "year": 2082,
    "totalMarks": 100,
    "duration": 180,
    "sections": ["A", "B", "C", "D"],
    "isActive": true,
    "createdAt": { "$date": "2025-01-10T12:00:00.000Z" },
    "updatedAt": { "$date": "2025-01-10T12:00:00.000Z" }
  },
  {
    "testId": "see_2082_math",
    "questions": {
      "groupA": [
        {
          "id": "1a",
          "type": "multiple_choice",
          "questionNepali": "Your Nepali question",
          "questionEnglish": "Your English question",
          "options": [
            { "id": "i", "nepali": "Option 1 Nepali", "english": "Option 1 English" },
            { "id": "ii", "nepali": "Option 2 Nepali", "english": "Option 2 English" },
            { "id": "iii", "nepali": "Option 3 Nepali", "english": "Option 3 English" },
            { "id": "iv", "nepali": "Option 4 Nepali", "english": "Option 4 English" }
          ],
          "correctAnswer": "ii",
          "marks": 1
        }
      ],
      "groupB": [
        {
          "id": "2a",
          "type": "short_answer",
          "questionNepali": "Short answer question in Nepali",
          "questionEnglish": "Short answer question in English",
          "marks": 1
        }
      ],
      "groupC": [
        {
          "id": "3",
          "type": "long_answer",
          "questionNepali": "Long answer question in Nepali",
          "questionEnglish": "Long answer question in English",
          "marks": 2
        }
      ],
      "groupD": [
        {
          "id": "17",
          "type": "essay",
          "questionNepali": "Essay question in Nepali",
          "questionEnglish": "Essay question in English",
          "marks": 4
        }
      ]
    }
  }
]
\`\`\`

### Step 2: Import the Test
\`\`\`bash
node scripts/import-test-json.mjs --file ./data/my-new-test.json
\`\`\`

### Step 3: Verify Import
\`\`\`bash
node scripts/verify-port-47017.mjs
\`\`\`

## Method 2: Using Template Generator

### Step 1: Generate Template
\`\`\`bash
node scripts/create-test-template.mjs --id see_2082_english --subject english --title "SEE 2082 English"
\`\`\`

### Step 2: Edit the Generated File
Open `data/see_2082_english.json` and add your questions

### Step 3: Import
\`\`\`bash
node scripts/import-test-json.mjs --file ./data/see_2082_english.json
\`\`\`

## Method 3: Direct MongoDB Insert (Advanced)

You can also add tests directly through MongoDB Compass:

1. Connect to `mongodb://127.0.0.1:47017`
2. Go to database `see_exam_system`
3. Add document to `practice_tests` collection
4. Add document to `questions` collection with matching `testId`

## Key Points:

1. **Test ID**: Must be unique and match between practice_tests._id and questions.testId
2. **No Hardcoding**: All test data comes from the database
3. **Dynamic Loading**: The app automatically loads all tests from the database
4. **Flexible Structure**: You can have different numbers of questions in each group
5. **Empty Tests**: Tests with no questions will show "Coming Soon" message

## Troubleshooting:

- **Test not showing**: Check that practice_tests._id matches questions.testId
- **Questions not loading**: Verify the question structure matches the expected format
- **Import errors**: Check JSON syntax and ensure MongoDB is running on port 47017
