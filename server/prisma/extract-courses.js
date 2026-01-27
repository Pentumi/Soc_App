const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('C:\\Users\\dean\\Downloads\\ireland_golf_courses.xlsx');

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total courses in Excel:', data.length);
console.log('First few entries:', JSON.stringify(data.slice(0, 5), null, 2));

// Save to JSON file for easier processing
fs.writeFileSync('courses-from-excel.json', JSON.stringify(data, null, 2));
console.log('Saved to courses-from-excel.json');
