const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/porte/Desktop/Looma-SEE/nepali-exam-helper/app-code/data';

const files = [
    "see_2081_nepali_practice_1_generated.json",
    "see_2081_nepali_practice_2_generated.json",
    "see_2081_nepali_practice_3_generated.json",
    "see_2081_nepali_practice_4_generated.json",
    "see_2081_nepali_practice_5_generated.json"
];

files.forEach(fileName => {
    const filePath = path.join(directory, fileName);
    console.log(`Processing ${fileName}...`);

    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);

        if (!Array.isArray(data) || data.length === 0) {
            console.log(`Skipping ${fileName}: Invalid JSON structure`);
            return;
        }

        const header = data[0];

        // Create new header object to enforce order
        const newHeader = {};

        // Add all keys except instructions first
        Object.keys(header).forEach(key => {
            if (key !== 'instructionsNepali' && key !== 'instructionsEnglish') {
                newHeader[key] = header[key];
            }
        });

        // Add instructions at the end
        if (header.instructionsNepali) {
            newHeader.instructionsNepali = header.instructionsNepali;
        }
        if (header.instructionsEnglish) {
            newHeader.instructionsEnglish = header.instructionsEnglish;
        }

        // Replace header
        data[0] = newHeader;

        // Write back
        // Using explicit spacing to try to match likely formatting, 2 spaces is standard
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully updated ${fileName}`);

    } catch (err) {
        console.error(`Error processing ${fileName}:`, err);
    }
});
