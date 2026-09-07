const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace single-quoted localhost URLs: 'http://localhost:3001/api/...' -> `${API_BASE}/api/...`
const singleQuoteRegex = /'http:\/\/localhost:3001\/api\/([^']+)'/g;
content = content.replace(singleQuoteRegex, '`${API_BASE}/api/$1`');

// 2. Replace template literal localhost URLs: http://localhost:3001 -> ${API_BASE}
const hostRegex = /http:\/\/localhost:3001/g;
content = content.replace(hostRegex, '${API_BASE}');

// 3. Define API_BASE right after imports around line 133 (now safe because the replacement has already run)
const insertPos = content.indexOf('const lowlight = createLowlight(all);');
if (insertPos !== -1) {
  const insertText = '\nconst API_BASE = window.location.hostname === \'localhost\' ? \'http://localhost:3001\' : \'\';\n';
  content = content.slice(0, insertPos + 'const lowlight = createLowlight(all);'.length) +
            insertText +
            content.slice(insertPos + 'const lowlight = createLowlight(all);'.length);
  console.log('Inserted API_BASE definition.');
} else {
  console.error('Could not find insert position for API_BASE definition!');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated App.jsx successfully.');
