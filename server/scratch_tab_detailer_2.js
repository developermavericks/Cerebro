const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, '..', 'src', 'App.jsx');
const content = fs.readFileSync(appJsxPath, 'utf8');
const lines = content.split('\n');

const tabRanges = [
  { tab: 'dashboard', start: 1720, end: 1731 },
  { tab: 'article-reach', start: 1731, end: 2199 },
  { tab: 'keyword-search', start: 2199, end: 2711 },
  { tab: 'competitor-analysis', start: 2711, end: 2884 },
  { tab: 'settings', start: 2884, end: 3061 }
];

console.log('=== Detailed Tab Analysis Part 2 ===');

tabRanges.forEach(({ tab, start, end }) => {
  console.log(`\n\n==================== TAB: ${tab.toUpperCase()} (Lines ${start} to ${end}) ====================`);
  const tabLines = lines.slice(start - 1, end);
  
  const headers = [];
  const buttons = [];
  const textLabels = [];
  const comments = [];
  
  tabLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      comments.push(`Line ${start + idx}: ${trimmed}`);
    }
    if (trimmed.match(/<h[1-6]/i) || trimmed.includes('text-lg font-bold') || trimmed.includes('text-xl font-bold') || trimmed.includes('text-2xl font-bold') || trimmed.includes('text-[10px] font-black')) {
      headers.push(`Line ${start + idx}: ${trimmed}`);
    }
    if (trimmed.startsWith('<button') || trimmed.includes('onClick=')) {
      if (buttons.length < 30) {
        buttons.push(`Line ${start + idx}: ${trimmed}`);
      }
    }
    if (trimmed.includes('type="text"') || trimmed.includes('type="password"') || trimmed.includes('<input') || trimmed.includes('<textarea') || trimmed.includes('<select')) {
      textLabels.push(`Line ${start + idx}: ${trimmed}`);
    }
  });

  console.log('--- Key Comments & Sections ---');
  console.log(comments.slice(0, 15).join('\n') || 'None');
  
  console.log('\n--- Headings & Card Titles ---');
  console.log(headers.slice(0, 20).join('\n') || 'None');
  
  console.log('\n--- Input Controls ---');
  console.log(textLabels.slice(0, 15).join('\n') || 'None');
  
  console.log('\n--- Interactive Actions (Buttons/Clicks) ---');
  console.log(buttons.slice(0, 15).join('\n') || 'None');
});
