const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('Running Playwright tests and capturing results as JSON...');

let jsonOutput;
try {
  // Run playwright test and capture the json reporter output
  const buffer = execSync('npx playwright test --reporter=json', {
    maxBuffer: 25 * 1024 * 1024,
    env: { ...process.env }
  });
  jsonOutput = buffer.toString();
} catch (error) {
  // If tests fail, execSync will throw. The stdout will still contain the json results.
  if (error.stdout) {
    jsonOutput = error.stdout.toString();
  } else {
    console.error('Failed to run Playwright tests:', error.message);
    process.exit(1);
  }
}

try {
  // Find start of JSON structure in case there are warnings or other text logged before the JSON
  const startIdx = jsonOutput.indexOf('{');
  if (startIdx === -1) {
    throw new Error('No JSON output found in test runner response');
  }
  const cleanJson = jsonOutput.substring(startIdx);

  const reportData = JSON.parse(cleanJson);
  const rows = [];

  // Parse the suites and test results
  function parseSuite(suite, suitePath = []) {
    const currentPath = [...suitePath, suite.title].filter(Boolean);
    
    if (suite.suites) {
      suite.suites.forEach(s => parseSuite(s, currentPath));
    }
    
    if (suite.specs) {
      suite.specs.forEach(spec => {
        const testName = spec.title;
        const file = path.basename(spec.file);
        
        spec.tests.forEach(test => {
          test.results.forEach(result => {
            rows.push({
              'Test File': file,
              'Suite Name': currentPath.join(' > '),
              'Test Name': testName,
              'Status': result.status.toUpperCase(),
              'Duration (s)': (result.duration / 1000).toFixed(2),
              'Errors': result.errors.map(e => e.message).join('\n') || 'None'
            });
          });
        });
      });
    }
  }

  if (reportData.suites) {
    reportData.suites.forEach(suite => parseSuite(suite));
  }

  // Create Excel Worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Execution Report');

  // Adjust column widths automatically
  const colWidths = [
    { wch: 20 }, // Test File
    { wch: 45 }, // Suite Name
    { wch: 50 }, // Test Name
    { wch: 12 }, // Status
    { wch: 15 }, // Duration (s)
    { wch: 40 }  // Errors
  ];
  worksheet['!cols'] = colWidths;

  const outputPath = path.resolve(__dirname, 'test_run_report.xlsx');
  XLSX.writeFile(workbook, outputPath);

  console.log(`\n==================================================`);
  console.log(`Excel test run report generated successfully!`);
  console.log(`Report Location: ${outputPath}`);
  console.log(`Total Scenarios Checked: ${rows.length}`);
  console.log(`Passed: ${rows.filter(r => r.Status === 'PASSED').length}`);
  console.log(`Failed: ${rows.filter(r => r.Status === 'FAILED' || r.Status === 'TIMEDOUT').length}`);
  console.log(`==================================================\n`);

} catch (err) {
  console.error('Failed to parse test results or write Excel file:', err);
  process.exit(1);
}
