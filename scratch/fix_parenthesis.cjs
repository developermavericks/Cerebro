const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the duplicate );
content = content.replace(/\);\s*\);\s*\}\);\s*\}\)\(\)\}/, ');\n                                             });\n                                           })()}');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Syntax error fixed successfully!");
