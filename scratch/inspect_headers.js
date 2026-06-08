const xlsx = require('xlsx');
const path = require('path');

const excelPath = path.resolve(__dirname, '../NEXUS_Consultancies_2026-05-18.xlsx');
const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);
if (data.length > 0) {
  console.log('Available columns:', Object.keys(data[0]));
  console.log('Sample row:', data[0]);
} else {
  console.log('No data rows found.');
}
