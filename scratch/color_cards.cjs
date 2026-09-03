const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex that targets:
// return ( <div key={brand} onClick={() => setCuratedDrillBrand(brand)} ...
// up to: <TrendingUp size={11} style={{ color: isSelected ? color : '#64748b' }} />
const cardRegex = /return\s*\(\s*<div\s*key=\{brand\}\s*onClick=\{\(\)\s*=>\s*setCuratedDrillBrand\(brand\)\}\s*className=\{\`group\/card relative cursor-pointer \$[\s\S]*?<TrendingUp\s*size=\{11\}\s*style=\{\{\s*color:\s*isSelected\s*\?\s*color\s*:\s*'#64748b'\s*\}\}\s*\/>/i;

if (!cardRegex.test(content)) {
  console.error("Could not find the card block using regex in App.jsx!");
  process.exit(1);
}

const replacementText = `return (
                                <div
                                  key={brand}
                                  onClick={() => setCuratedDrillBrand(brand)}
                                  className={\`group/card relative cursor-pointer \${
                                    darkMode 
                                      ? 'bg-[#0d1527] border-white/5 hover:border-white/10' 
                                      : 'bg-white border-slate-200'
                                  } border rounded-[1.75rem] p-6 shadow-md transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between\`}
                                  style={{
                                    borderColor: isSelected ? color : undefined,
                                    boxShadow: isSelected ? \`0 10px 30px \${color}25\` : undefined
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span 
                                      className="text-xs font-extrabold uppercase tracking-wider truncate pr-4"
                                      style={{ color }}
                                    >
                                      {brand}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest border border-slate-700/50 dark:border-white/10 px-1.5 py-0.5 rounded text-slate-400">
                                      INFO
                                    </span>
                                  </div>

                                  <div className="flex flex-col mt-3">
                                    <div className="flex items-baseline gap-0.5 select-none">
                                      <span 
                                        className="text-[44px] font-black tracking-tight leading-none"
                                        style={{ color }}
                                      >
                                        {pct}
                                      </span>
                                      <span 
                                        className="text-[18px] font-black"
                                        style={{ color }}
                                      >
                                        %
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400/80 mt-1 select-none">
                                      Mention Share
                                    </span>
                                  </div>

                                  <div className="w-full border-t border-slate-200 dark:border-white/10 my-3" />

                                  <div className="text-[9px] font-extrabold text-slate-400 flex items-center gap-1.5 select-none">
                                    <TrendingUp size={11} style={{ color }} />`;

content = content.replace(cardRegex, replacementText);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully color coded all cards using regex!");
