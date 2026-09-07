const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, '..', 'src', 'App.jsx');
const content = fs.readFileSync(appJsxPath, 'utf8');
const lines = content.split('\n');

console.log('--- Printing lines 1720 to 1760 ---');
for (let i = 1719; i < 1760; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
