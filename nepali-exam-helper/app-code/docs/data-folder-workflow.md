# Data Folder Workflow

## 📁 How It Works

1. **Drop JSON files** into the `data/` folder
2. **Run the import script** to sync everything to database
3. **Test in the app** - all tests appear automatically

## 🚀 Quick Commands

### Import All Tests from data/ Folder
\`\`\`bash
node scripts/import-all-tests.mjs
\`\`\`

### Alternative Command (Same Thing)
\`\`\`bash
node scripts/sync-data-folder.mjs
\`\`\`

### Check What's in Database
\`\`\`bash
node scripts/verify-port-47017.mjs
\`\`\`

## 📋 File Structure

\`\`\`
data/
├── see-2081.json          # Your existing test
├── see-2082-math.json     # New math test
├── see-2082-english.json  # New English test
└── any-other-test.json    # Any other tests
\`\`\`

## ✅ Benefits

- **Drop and Go**: Just add JSON files to data/ folder
- **Bulk Import**: Imports all tests at once
- **Safe Updates**: Won't duplicate, just updates existing tests
- **Error Handling**: Skips invalid files, continues with others
- **Clear Feedback**: Shows exactly what was imported/updated

## 🔄 Typical Workflow

1. **Restore your missing test**:
   \`\`\`bash
   # Your see-2081.json is already in data/ folder
   node scripts/import-all-tests.mjs
   \`\`\`

2. **Add new tests**:
   \`\`\`bash
   # Create new JSON file in data/
   # Then sync everything
   node scripts/import-all-tests.mjs
   \`\`\`

3. **Test everything**:
   \`\`\`bash
   npm run dev
   \`\`\`

## 📝 JSON File Format

Each JSON file should contain an array with two objects:

\`\`\`json
[
  {
    "_id": "unique_test_id",
    "title": "Test Title",
    "titleNepali": "नेपाली शीर्षक",
    "subject": "subject_name",
    "year": 2082,
    "totalMarks": 75,
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

## 🚨 Error Handling

The script will:
- ✅ Skip invalid JSON files
- ✅ Skip files missing required fields
- ✅ Continue processing other files if one fails
- ✅ Show clear error messages
- ✅ Update existing tests safely
