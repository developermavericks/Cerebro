const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const excelFiles = fs.readdirSync(rootDir).filter(f => f.startsWith('NEXUS_') && f.endsWith('.xlsx'));

for (const file of excelFiles) {
  const excelPath = path.resolve(rootDir, file);
  const wb = xlsx.readFile(excelPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  const matchedValues = new Set(data.map(r => r['Keyword Matched']));
  console.log(`File: ${file}`);
  console.log(`  Row count: ${data.length}`);
  console.log(`  Unique 'Keyword Matched' values:`, Array.from(matchedValues));
}
