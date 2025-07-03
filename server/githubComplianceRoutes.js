const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const REPORTS_DIR = path.join(__dirname, 'data', 'analysis-reports');

// POST: Receive and store a GitHub compliance result
router.post('/report', (req, res) => {
  try {
    const result = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `github-compliance-${timestamp}.json`;
    const filePath = path.join(REPORTS_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    res.json({ status: 'ok', message: 'GitHub compliance result stored', file: filename });
  } catch (error) {
    console.error('Error storing GitHub compliance result:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET: Fetch all GitHub compliance results
router.get('/reports', (req, res) => {
  try {
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('github-compliance-') && f.endsWith('.json'));
    const reports = files.map(file => {
      const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf-8');
      return JSON.parse(content);
    });
    res.json({ status: 'ok', data: reports });
  } catch (error) {
    console.error('Error fetching GitHub compliance reports:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router; 