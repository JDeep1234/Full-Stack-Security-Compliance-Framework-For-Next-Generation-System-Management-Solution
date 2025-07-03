// generateMcp.js
// Converts extracted metadata into MCP (Model Context Protocol) JSON
// Usage: node generateMcp.js <metadata-file>

const fs = require('fs');

function generateMcp(metadataFile) {
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
  const mcp = {
    mcpVersion: '1.0',
    timestamp: new Date().toISOString(),
    workflows: metadata
  };
  fs.writeFileSync('mcp.json', JSON.stringify(mcp, null, 2));
  console.log('MCP generation complete. Output: mcp.json');
}

if (require.main === module) {
  const metadataFile = process.argv[2] || 'extracted_metadata.json';
  generateMcp(metadataFile);
} 