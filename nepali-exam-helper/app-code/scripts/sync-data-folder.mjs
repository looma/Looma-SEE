// Alternative script name for the same functionality
// Usage: node scripts/sync-data-folder.mjs
// This just calls the main import script with a more descriptive name

// This script uses port 47017 via the import-all-tests.mjs script

import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const importScript = path.join(__dirname, "import-all-tests.mjs")

console.log("🔄 Syncing data/ folder with database...")
console.log("=" .repeat(50))

const child = spawn("node", [importScript], { 
  stdio: "inherit",
  env: process.env 
})

child.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Sync completed successfully!")
  } else {
    console.error(`\n❌ Sync failed with code ${code}`)
    process.exit(code)
  }
})
