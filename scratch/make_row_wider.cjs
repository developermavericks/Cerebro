const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex targeting: {/* Filter Card Container */} <div className={`p-4 rounded-[2rem] w-full max-w-4xl ...
const containerRegex = /\{\/\*\s*Filter\s+Card\s+Container\s*\*\/\}\s*<div\s*className=\{\`p-4\s+rounded-\[2rem\]\s+w-full\s+max-w-4xl/i;

if (!containerRegex.test(content)) {
  console.error("Filter container not found using regex!");
  process.exit(1);
}

content = content.replace(containerRegex, (match) => {
  return `{/* Filter Card Container */}
                           <div className={\`p-4 rounded-[2rem] w-full max-w-[95%] xl:max-w-7xl`;
});

// Also update search input size
const searchTarget = /<div\s+className="relative\s+w-full\s+md:w-60\s+shrink-0">/i;
content = content.replace(searchTarget, '<div className="relative w-full md:w-80 shrink-0">');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully widened the controls row using regex!");
