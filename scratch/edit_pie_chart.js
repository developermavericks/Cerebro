const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the target code block
const target = `                                               // Clean constant radius for a perfect cohesive Pie Chart
                                               const R = 22;
                                               const C = Math.PI * R;
                                               const strokeLength = (pct / 100) * C;
                                               const strokeGap = C - strokeLength;
                                               const offset = (currentOffset / 100) * C;

                                               const explodeDistance = 0.8; // Small premium gap between slices
                                               const dx = Math.cos(angleRad) * explodeDistance;
                                               const dy = Math.sin(angleRad) * explodeDistance;

                                               return (
                                                 <circle
                                                   key={brand}
                                                   r={R / 2}
                                                   cx="16"
                                                   cy="16"
                                                   fill="transparent"
                                                   stroke={color}
                                                   strokeWidth={R}
                                                   strokeDasharray={\`\${strokeLength} \${strokeGap}\`}
                                                   strokeDashoffset={offset}`;

const replacement = `                                               // Path radius is ALWAYS constant to prevent angular overlap/misalignment
                                               const rPath = 11;
                                               const C = 2 * Math.PI * rPath;
                                               const strokeLength = (pct / 100) * C;
                                               const strokeGap = C - strokeLength;
                                               const offset = (currentOffset / 100) * C;

                                               // Vary only the stroke width to scale thickness without overlapping in angle!
                                               const strokeWidth = isPolarStyle 
                                                 ? 12 + (pct / 100) * 16 
                                                 : 22;

                                               const explodeDistance = 0.8; // Small premium gap between slices
                                               const dx = Math.cos(angleRad) * explodeDistance;
                                               const dy = Math.sin(angleRad) * explodeDistance;

                                               return (
                                                 <circle
                                                   key={brand}
                                                   r={rPath}
                                                   cx="16"
                                                   cy="16"
                                                   fill="transparent"
                                                   stroke={color}
                                                   strokeWidth={strokeWidth}
                                                   strokeDasharray={\`\${strokeLength} \${strokeGap}\`}
                                                   strokeDashoffset={offset}`;

if (!content.includes(target)) {
  console.error("Target content not found! Check indentation.");
  process.exit(1);
}

// Also need to define isPolarStyle
const targetDefine = `                                             let cumulativePct = 0;
                                             return entries.map(([brand, data], idx) => {`;

const replacementDefine = `                                             let cumulativePct = 0;
                                             const isPolarStyle = entries.length <= 4;
                                             return entries.map(([brand, data], idx) => {`;

content = content.replace(targetDefine, replacementDefine);
content = content.replace(target, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated App.jsx!");
