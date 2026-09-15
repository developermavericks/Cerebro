const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex targeting: if (curatedVisualizationType === 'Bar Chart') { ... } else {
const barRegex = /if\s*\(curatedVisualizationType\s*===\s*'Bar Chart'\)\s*\{\s*return\s*\(\s*<div\s*className="flex flex-col h-52 pt-4">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}\s*else\s*\{/i;

if (!barRegex.test(content)) {
  console.error("Could not find the Bar Chart code block in App.jsx!");
  process.exit(1);
}

const replacement = `if (curatedVisualizationType === 'Bar Chart') {
                                  return (
                                    <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
                                      {/* Left: Bar Chart */}
                                      <div className="flex-1 w-full flex flex-col h-44 justify-center">
                                        {/* Bars area */}
                                        <div className="flex-1 flex items-end justify-around border-b border-slate-200 dark:border-white/10 pb-2 px-4 gap-4">
                                          {entries.map(([brand, data], idx) => {
                                            const pct = ((data.mentions / total) * 100).toFixed(1);
                                            const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                            const heightPct = Math.max(parseFloat(pct), 4);
                                            return (
                                              <div key={brand} className="flex-1 flex flex-col items-center h-full justify-end group">
                                                <span className="text-[9px] font-black mb-1 transition-transform duration-300 group-hover:scale-110" style={{ color }}>
                                                  {pct}%
                                                </span>
                                                <div 
                                                  className="w-full max-w-[24px] rounded-t-md transition-all duration-700 shadow-sm hover:brightness-110 cursor-pointer"
                                                  style={{ 
                                                    height: \`\${heightPct}%\`, 
                                                    backgroundColor: color 
                                                  }}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {/* Labels area */}
                                        <div className="flex justify-around pt-2 px-4 gap-4">
                                          {entries.map(([brand]) => (
                                            <div key={brand} className="flex-1 text-center truncate">
                                              <span className={\`text-[9px] font-black uppercase tracking-wider truncate block \${darkMode ? 'text-slate-400' : 'text-slate-600'}\`}>
                                                {brand}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Right: Legend list */}
                                      <div className="space-y-3 flex-1 w-full max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {entries.map(([brand, data], idx) => {
                                          const pct = ((data.mentions / total) * 100).toFixed(1);
                                          const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                          return (
                                            <div key={brand} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2.5 truncate pr-2">
                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                                                <span className={\`font-bold truncate \${darkMode ? 'text-slate-200' : 'text-slate-700'}\`}>{brand}</span>
                                              </div>
                                              <span className="font-black flex-shrink-0" style={{ color }}>{pct}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                } else {`;

content = content.replace(barRegex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated Bar Chart layout to include the legend!");
