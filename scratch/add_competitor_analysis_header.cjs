const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<\/div>\s*<div\s+className="w-full\s+max-w-4xl\s+mx-auto\s+bg-white\/50\s+backdrop-blur-xl\s+border\s+border-slate-200/i;

if (!regex.test(content)) {
  console.error("Target pattern for competitor analysis header not found!");
  process.exit(1);
}

const replacement = `</div>

                    <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in duration-700">
                      <h1 className={\`text-5xl tracking-tight mb-3 \${darkMode ? 'text-white' : 'text-slate-900'}\`}>
                        <span className="font-light">Competitor</span> <span className="font-black">Analysis</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        Compare media share of voice, sentiment dynamics, and coverage metrics side-by-side
                      </p>
                    </div>

                    <div className="w-full max-w-4xl mx-auto bg-white/50 backdrop-blur-xl border border-slate-200`;

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully added Competitor Analysis header title!");
