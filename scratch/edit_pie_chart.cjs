const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to locate cumulativeOffset and return map block
const defineRegex = /let\s+cumulativeOffset\s*=\s*25;\s*let\s+cumulativePct\s*=\s*0;\s*return\s+entries\.map\(\(\[brand,\s*data\],\s*idx\)\s*=>\s*\{/i;

if (!defineRegex.test(content)) {
  console.error("Could not find define block in App.jsx!");
  process.exit(1);
}

content = content.replace(defineRegex, (match) => {
  return `let cumulativeOffset = 25;
                                             let cumulativePct = 0;
                                             const isPolarStyle = entries.length <= 4;
                                             return entries.map(([brand, data], idx) => {`;
});

// Use regex to find the circle calculations and circle return block
const circleRegex = /\/\/.*Clean constant radius for a perfect cohesive Pie Chart[\s\S]*?<circle[\s\S]*?\/>/i;

if (!circleRegex.test(content)) {
  console.error("Could not find circle rendering block in App.jsx!");
  process.exit(1);
}

content = content.replace(circleRegex, (match) => {
  return `// Path radius is ALWAYS constant to prevent angular overlap/misalignment
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
                                                   strokeDashoffset={offset}
                                                   style={{ 
                                                     transform: \`translate(\${dx}px, \${dy}px)\`,
                                                     transition: 'transform 0.3s ease'
                                                   }}
                                                   className="hover:brightness-110 cursor-pointer"
                                                 />
                                               );`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated App.jsx using regex!");
