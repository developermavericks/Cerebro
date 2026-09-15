const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Exclude article-reach from the main top welcome header block
const headerTarget = `activeTab !== 'competitor-analysis' && activeTab !== 'dashboard' && (`;
const headerReplacement = `activeTab !== 'competitor-analysis' && activeTab !== 'dashboard' && activeTab !== 'article-reach' && (`;

if (!content.includes(headerTarget)) {
  console.error("Main header condition not found!");
  process.exit(1);
}
content = content.replace(headerTarget, headerReplacement);

// 2. Replace the body of activeTab === 'article-reach' when !isScanningReach
// Target structure:
// <div className={`flex flex-col ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto w-full animate-in fade-in duration-700 pr-2 transition-all duration-500`}>
//   {!isScanningReach ? (
//      <div className="space-y-10"> ... </div>
//   ) : reachScanning ...
const bodyRegex = /!isScanningReach\s*\?\s*\(\s*<div\s+className="space-y-10">[\s\S]*?<\/div>\s*<\/div>\s*\)\s*:\s*reachScanning\s*&&\s*reachMode\s*===\s*'single'/i;

if (!bodyRegex.test(content)) {
  console.error("Article reach body block not found!");
  process.exit(1);
}

const replacementBody = `!isScanningReach ? (
                      <div className="space-y-8">
                        {/* Top layout with Refresh and Header */}
                        <div className="flex flex-col">
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={handleArticleReachRefresh}
                              disabled={isRefreshingReach}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/80 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                            >
                              {isRefreshingReach && (
                                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              {isRefreshingReach ? 'Refreshing...' : 'Refresh'}
                            </button>
                          </div>

                          <div className="text-center max-w-2xl mx-auto mb-12">
                            <h1 className={\`text-5xl tracking-tight mb-3 \${darkMode ? 'text-white' : 'text-slate-900'}\`}>
                              <span className="font-light">Article</span> <span className="font-black">Reach</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                              Monitor your brand exposure, analyze sentiment patterns, and generate high-fidelity reports instantly.
                            </p>
                          </div>
                        </div>

                        {/* Interactive Expanding Panels */}
                        <div className="flex flex-col md:flex-row gap-8 items-stretch w-full min-h-[340px]">
                          {/* Panel 1: Single URL Reach Check */}
                          <div 
                            onClick={() => activeReachPanel !== 'single' && setActiveReachPanel('single')}
                            className={\`relative transition-all duration-500 ease-in-out border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer \${
                              activeReachPanel === 'single'
                                ? 'flex-[3] bg-white dark:bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5'
                                : activeReachPanel === 'bulk'
                                  ? 'flex-[1] bg-slate-50/55 dark:bg-slate-900/30 border-slate-100 dark:border-white/5 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 justify-center items-center text-center'
                                  : 'flex-1 bg-white dark:bg-[#151f32] border-slate-200/60 dark:border-white/5 shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/20 hover:shadow-lg'
                            }\`}
                          >
                            {activeReachPanel === 'bulk' ? (
                              <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                                  <Globe size={24} />
                                </div>
                                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Single Scan</h3>
                                <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Click to Expand</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0">
                                    <Globe size={26} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Single URL Check</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Analyze reach for a single article link</p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-4 mt-auto">
                                  <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                      type="text"
                                      placeholder="Paste article URL here..."
                                      className={\`w-full py-4 pl-12 pr-6 \${
                                        darkMode 
                                          ? 'bg-slate-950/40 border border-white/5 text-white' 
                                          : 'bg-slate-50 border border-slate-200/60 text-slate-900'
                                      } rounded-2xl text-xs font-bold outline-none transition-all focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600\`}
                                      value={reachUrl}
                                      onChange={(e) => setReachUrl(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between gap-4 mt-2" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Engine:</span>
                                      <select
                                        value={reachVersion}
                                        onChange={(e) => setReachVersion(e.target.value)}
                                        className={\`py-2 px-3 \${
                                          darkMode ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-50 border border-slate-200 text-slate-600'
                                        } rounded-xl text-[9px] font-black uppercase tracking-wider outline-none focus:border-indigo-600 cursor-pointer\`}
                                      >
                                        <option value="v9">v9.0 Sovereign</option>
                                        <option value="v8">v8.0 Oracle</option>
                                        <option value="v7">v7.0 Truth</option>
                                        <option value="v6">v6.0 Integrated</option>
                                        <option value="v5">v5.0 Agentic</option>
                                      </select>
                                    </div>

                                    <button
                                      onClick={handleReachScan}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                                    >
                                      <Zap size={14} /> Check Reach
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Panel 2: Bulk Excel Reach Check */}
                          <div 
                            onClick={() => activeReachPanel !== 'bulk' && setActiveReachPanel('bulk')}
                            className={\`relative transition-all duration-500 ease-in-out border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer \${
                              activeReachPanel === 'bulk'
                                ? 'flex-[3] bg-white dark:bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5'
                                : activeReachPanel === 'single'
                                  ? 'flex-[1] bg-slate-50/55 dark:bg-slate-900/30 border-slate-100 dark:border-white/5 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 justify-center items-center text-center'
                                  : 'flex-1 bg-white dark:bg-[#151f32] border-slate-200/60 dark:border-white/5 shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/20 hover:shadow-lg'
                            }\`}
                          >
                            {activeReachPanel === 'single' ? (
                              <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                                  <FileText size={24} />
                                </div>
                                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Batch Scan</h3>
                                <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Click to Expand</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0">
                                    <FileText size={26} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Batch Analysis</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Process multiple article links in bulk via Excel</p>
                                  </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-end mt-auto relative" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleExcelUpload}
                                  />
                                  <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center group hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-all cursor-pointer">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-all duration-300">
                                      <FileText size={20} className="text-slate-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Upload Excel Document</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accepts .xlsx, .xls formats</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : reachScanning && reachMode === 'single';`;

content = content.replace(bodyRegex, replacementBody);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated Article Reach layout with expanding panels!");
