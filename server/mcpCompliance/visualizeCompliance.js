// visualizeCompliance.js
// Displays or outputs compliance results from policy evaluation
// Usage: node visualizeCompliance.js <results-file>

const fs = require('fs');
const axios = require('axios');

async function visualizeCompliance(resultsFile) {
  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
  if (results.compliant) {
    console.log('✅ All workflows are compliant!');
  } else {
    console.log('❌ Compliance issues found:');
    results.details.forEach(d => {
      console.log(`- [${d.file}] ${d.issue}`);
    });
  }
  console.log('Compliance visualization complete.');

  // POST results to backend
  try {
    const response = await axios.post('http://localhost:3001/api/github-compliance/report', results);
    console.log('Compliance results sent to backend:', response.data);
  } catch (e) {
    console.error('Failed to send compliance results to backend:', e.message);
  }
}

if (require.main === module) {
  const resultsFile = process.argv[2] || 'policy_results.json';
  visualizeCompliance(resultsFile);
} 