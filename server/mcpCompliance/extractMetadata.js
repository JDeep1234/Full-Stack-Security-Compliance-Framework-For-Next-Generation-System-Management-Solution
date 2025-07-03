// extractMetadata.js
// Extracts metadata from GitHub Actions workflow files
// Usage: node extractMetadata.js <workflow-directory>

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function extractMetadata(workflowDir) {
  const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  const metadata = files.map(file => {
    const filePath = path.join(workflowDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let parsed = {};
    try {
      parsed = yaml.load(content);
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e);
    }
    return {
      file,
      name: parsed.name || null,
      on: parsed.on || null,
      jobs: parsed.jobs ? Object.keys(parsed.jobs) : [],
    };
  });
  fs.writeFileSync('extracted_metadata.json', JSON.stringify(metadata, null, 2));
  console.log('Metadata extraction complete. Output: extracted_metadata.json');
}

if (require.main === module) {
  const workflowDir = process.argv[2] || '.github/workflows';
  extractMetadata(workflowDir);
} 