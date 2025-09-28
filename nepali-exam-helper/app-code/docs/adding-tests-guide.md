# Adding New Practice Tests and Sections

## Step 1: Check Current Database
First, verify what's currently in your database:
\`\`\`bash
node scripts/check-database.mjs
\`\`\`

## Step 2: Create Test Data
Create a JSON file in the `data/` folder with this structure:

\`\`\`json
[
  {
    "_id": "unique_test_id",
    "title": "Test Title in English",
    "titleNepali": "Test Title in Nepali",
    "subject": "subject_name",
    "year": 2082,
    "totalMarks": 100,
    "duration": 180,
    "sections": ["A", "B", "C", "D"],
    "isActive": true,
    "createdAt": { "$date": "2025-01-10T12:00:00.000Z" },
    "updatedAt": { "$date": "2025-01-10T12:00:00.000Z" }
  },
  {
    "testId": "unique_test_id",
    "questions": {
      "groupA": [...],
      "groupB": [...],
      "groupC": [...],
      "groupD": [...]
    }
  }
]
\`\`\`

## Step 3: Question Structure

### Group A (Multiple Choice)
\`\`\`json
{
  "id": "1a",
  "type": "multiple_choice",
  "questionNepali": "Question in Nepali",
  "questionEnglish": "Question in English",
  "options": [
    { "id": "i", "nepali": "Option 1 Nepali", "english": "Option 1 English" },
    { "id": "ii", "nepali": "Option 2 Nepali", "english": "Option 2 English" },
    { "id": "iii", "nepali": "Option 3 Nepali", "english": "Option 3 English" },
    { "id": "iv", "nepali": "Option 4 Nepali", "english": "Option 4 English" }
  ],
  "correctAnswer": "ii",
  "marks": 1,
  "explanation": "Optional explanation"
}
\`\`\`

### Groups B, C, D (Free Response)
\`\`\`json
{
  "id": "2a",
  "type": "short_answer",
  "questionNepali": "Question in Nepali",
  "questionEnglish": "Question in English",
  "marks": 2,
  "sampleAnswer": "Sample answer for reference"
}
\`\`\`

## Step 4: Import the Test
\`\`\`bash
node scripts/import-test-json.mjs --file ./data/your-test-file.json
\`\`\`

## Step 5: Verify Import
- Check database: `node scripts/check-database.mjs`
- Visit: //api/tests
- Visit: //api/questions/your_test_id

## Adding New Subjects/Sections

### 1. Update TestSelector Component
Add new subjects to the dropdown and styling.

### 2. Update Question Types
If you need new question types beyond multiple choice and free response, update:
- Question interfaces in `lib/use-questions.ts`
- Rendering components in `components/`
- Grading logic in `api/grade/route.ts`

### 3. Update Styling
Add new color schemes for different subjects in `app/globals.css`:
\`\`\`css
.progress-math { background-color: rgb(219 234 254 / 0.6); }
.progress-math > div { background-color: rgb(59 130 246) !important; }
\`\`\`

## Common Issues

1. **Test not showing**: Check the testId matches between practice_tests._id and questions.testId
2. **Import conflicts**: Ensure _id is unique and createdAt/updatedAt are properly formatted
3. **Questions not loading**: Verify the question structure matches the expected format
4. **Grading errors**: Ensure all free-response questions have proper marks field

