const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Panel 1 target class string
const panel1Target = `                            className={\`relative border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer \${
                              activeReachPanel === 'single'
                                ? 'bg-white dark:bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5'
                                : activeReachPanel === 'bulk'
                                  ? 'bg-slate-50/55 dark:bg-slate-900/30 border-slate-100 dark:border-white/5 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 justify-center items-center text-center'
                                  : 'bg-white dark:bg-[#151f32] border-slate-200/60 dark:border-white/5 shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/20 hover:shadow-lg'
                            }\`}`;

// Panel 1 replacement
const panel1Replacement = `                            className={\`relative border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer transition-all duration-500 \${
                              activeReachPanel === 'single'
                                ? darkMode
                                  ? 'bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5 text-white'
                                  : 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 text-slate-900'
                                : activeReachPanel === 'bulk'
                                  ? darkMode
                                    ? 'bg-[#0d1527] border-white/5 text-slate-400 hover:bg-[#111a2f] hover:border-white/10 justify-center items-center text-center'
                                    : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:bg-slate-100/70 hover:border-slate-300 justify-center items-center text-center'
                                  : darkMode
                                    ? 'bg-[#151f32]/60 border-white/5 shadow-md text-white hover:border-indigo-500/30 hover:shadow-lg'
                                    : 'bg-white border-slate-200/60 shadow-md text-slate-900 hover:border-indigo-300 hover:shadow-lg'
                            }\`}`;

// Panel 2 target class string
const panel2Target = `                            className={\`relative border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer \${
                              activeReachPanel === 'bulk'
                                ? 'bg-white dark:bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5'
                                : activeReachPanel === 'single'
                                  ? 'bg-slate-50/55 dark:bg-slate-900/30 border-slate-100 dark:border-white/5 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 justify-center items-center text-center'
                                  : 'bg-white dark:bg-[#151f32] border-slate-200/60 dark:border-white/5 shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/20 hover:shadow-lg'
                            }\`}`;

// Panel 2 replacement
const panel2Replacement = `                            className={\`relative border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer transition-all duration-500 \${
                              activeReachPanel === 'bulk'
                                ? darkMode
                                  ? 'bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5 text-white'
                                  : 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 text-slate-900'
                                : activeReachPanel === 'single'
                                  ? darkMode
                                    ? 'bg-[#0d1527] border-white/5 text-slate-400 hover:bg-[#111a2f] hover:border-white/10 justify-center items-center text-center'
                                    : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:bg-slate-100/70 hover:border-slate-300 justify-center items-center text-center'
                                  : darkMode
                                    ? 'bg-[#151f32]/60 border-white/5 shadow-md text-white hover:border-indigo-500/30 hover:shadow-lg'
                                    : 'bg-white border-slate-200/60 shadow-md text-slate-900 hover:border-indigo-300 hover:shadow-lg'
                            }\`}`;

if (!content.includes(panel1Target)) {
  console.error("Panel 1 target code block not found!");
  process.exit(1);
}

if (!content.includes(panel2Target)) {
  console.error("Panel 2 target code block not found!");
  process.exit(1);
}

content = content.replace(panel1Target, panel1Replacement);
content = content.replace(panel2Target, panel2Replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated panel styling for optimal theme support!");
