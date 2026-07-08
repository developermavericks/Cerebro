const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to match the entire entries.map inside the SVG
const svgMapRegex = /let\s+cumulativeOffset\s*=\s*25;\s*let\s+cumulativePct\s*=\s*0;\s*const\s+isPolarStyle\s*=\s*entries\.length\s*<=\s*4;[\s\S]*?return\s+entries\.map\([\s\S]*?\}\);\s*\}\)\(\)\}/i;

if (!svgMapRegex.test(content)) {
  console.error("Could not find the SVG map block in App.jsx!");
  process.exit(1);
}

const replacement = `let cumulativeAngle = -Math.PI / 2;
                                            const isPolarStyle = entries.length <= 4;
                                            return entries.map(([brand, data], idx) => {
                                              if (data.mentions === 0) return null;
                                              const pct = (data.mentions / total) * 100;
                                              const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                              
                                              const angleLength = (pct / 100) * 2 * Math.PI;
                                              const startAngle = cumulativeAngle;
                                              const endAngle = cumulativeAngle + angleLength;
                                              cumulativeAngle = endAngle;

                                              const midAngle = (startAngle + endAngle) / 2;
                                              const explodeDistance = 0.8;
                                              const dx = Math.cos(midAngle) * explodeDistance;
                                              const dy = Math.sin(midAngle) * explodeDistance;

                                              const rOut = isPolarStyle ? 12 + (pct / 100) * 12 : 22;

                                              if (pct >= 99.9) {
                                                return (
                                                  <circle
                                                    key={brand}
                                                    cx="16"
                                                    cy="16"
                                                    r={rOut}
                                                    fill={color}
                                                    style={{ 
                                                      transform: \`translate(\${dx}px, \${dy}px)\`,
                                                      transition: 'transform 0.3s ease'
                                                    }}
                                                    className="hover:brightness-110 cursor-pointer"
                                                  />
                                                );
                                              }

                                              const x1 = 16 + rOut * Math.cos(startAngle);
                                              const y1 = 16 + rOut * Math.sin(startAngle);
                                              const x2 = 16 + rOut * Math.cos(endAngle);
                                              const y2 = 16 + rOut * Math.sin(endAngle);
                                              const largeArcFlag = pct > 50 ? 1 : 0;

                                              const dPath = \`M 16 16 L \${x1} \${y1} A \${rOut} \${rOut} 0 \${largeArcFlag} 1 \${x2} \${y2} Z\`;

                                              return (
                                                <path
                                                  key={brand}
                                                  d={dPath}
                                                  fill={color}
                                                  style={{ 
                                                    transform: \`translate(\${dx}px, \${dy}px)\`,
                                                    transition: 'transform 0.3s ease'
                                                  }}
                                                  className="hover:brightness-110 cursor-pointer"
                                                />
                                              );
                                            });
                                          })()}`;

content = content.replace(svgMapRegex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully converted App.jsx pie chart to paths!");
