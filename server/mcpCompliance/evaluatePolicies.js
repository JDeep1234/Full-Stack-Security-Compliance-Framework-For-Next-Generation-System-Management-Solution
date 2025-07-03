// evaluatePolicies.js
// Evaluates compliance policies against MCP data
// Usage: node evaluatePolicies.js <mcp-file>

const fs = require('fs');

function evaluatePolicies(mcpFile) {
  const mcp = JSON.parse(fs.readFileSync(mcpFile, 'utf-8'));
  const results = {
    compliant: true,
    details: []
  };
  mcp.workflows.forEach(wf => {
    if (!wf.name) {
      results.compliant = false;
      results.details.push({ file: wf.file, issue: 'Missing workflow name' });
    }
    if (!wf.jobs || wf.jobs.length === 0) {
      results.compliant = false;
      results.details.push({ file: wf.file, issue: 'No jobs defined' });
    }
  });
  fs.writeFileSync('policy_results.json', JSON.stringify(results, null, 2));
  console.log('Policy evaluation complete. Output: policy_results.json');
}

if (require.main === module) {
  const mcpFile = process.argv[2] || 'mcp.json';
  evaluatePolicies(mcpFile);
} 