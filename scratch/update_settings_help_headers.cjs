const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex for Settings header
const settingsRegex = /<div className="mb-10 text-center">\s*<h2 className="text-4xl font-black text-black tracking-tighter mb-2">Platform Settings<\/h2>\s*<p className="text-slate-500 font-bold text-sm">Manage your account preferences and system configurations\.<\/p>\s*<\/div>/i;

const settingsReplacement = `<div className="text-center max-w-2xl mx-auto mb-12">
                      <h1 className={\`text-5xl tracking-tight mb-3 \${darkMode ? 'text-white' : 'text-slate-900'}\`}>
                        <span className="font-light">Platform</span> <span className="font-black">Settings</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        Manage your account preferences and system configurations
                      </p>
                    </div>`;

// Regex for Help & Support header
const helpRegex = /<div className="mb-10 text-center">\s*<h2 className="text-4xl font-black text-black tracking-tighter mb-2 uppercase">Help & Support<\/h2>\s*<p className="text-slate-500 font-bold text-sm">Access the knowledge base or mail us an issue directly\.<\/p>\s*<\/div>/i;

const helpReplacement = `<div className="text-center max-w-2xl mx-auto mb-12">
                      <h1 className={\`text-5xl tracking-tight mb-3 \${darkMode ? 'text-white' : 'text-slate-900'}\`}>
                        <span className="font-light">Help &</span> <span className="font-black">Support</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        Access the knowledge base or mail us an issue directly
                      </p>
                    </div>`;

if (!settingsRegex.test(content)) {
  console.error("Settings header target not found!");
  process.exit(1);
}

if (!helpRegex.test(content)) {
  console.error("Help header target not found!");
  process.exit(1);
}

content = content.replace(settingsRegex, settingsReplacement);
content = content.replace(helpRegex, helpReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated Settings and Help headers!");
