const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Data directory for JSON files
const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to read JSON file
const readJsonFile = (filename) => {
  const filePath = path.join(dataDir, filename);
  try {
    if (!fs.existsSync(filePath)) {
      return null; // File doesn't exist yet
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Helper function to write JSON file
const writeJsonFile = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// ============ API ROUTES (MUST BE BEFORE STATIC FILES) ============

// Sports
app.get('/api/sports', (req, res) => {
  const data = readJsonFile('sports.json');
  res.json(data || []);
});

app.post('/api/sports', (req, res) => {
  const sports = req.body;
  if (writeJsonFile('sports.json', sports)) {
    res.json({ success: true, sports });
  } else {
    res.status(500).json({ error: 'Error saving sports' });
  }
});

// Matches
app.get('/api/matches', (req, res) => {
  const data = readJsonFile('matches.json');
  res.json(data || []);
});

app.post('/api/matches', (req, res) => {
  const matches = req.body;
  if (writeJsonFile('matches.json', matches)) {
    res.json({ success: true, matches });
  } else {
    res.status(500).json({ error: 'Error saving matches' });
  }
});

// Teams
app.get('/api/teams', (req, res) => {
  const data = readJsonFile('teams.json');
  res.json(data || []);
});

app.post('/api/teams', (req, res) => {
  const teams = req.body;
  if (writeJsonFile('teams.json', teams)) {
    res.json({ success: true, teams });
  } else {
    res.status(500).json({ error: 'Error saving teams' });
  }
});

// Players
app.get('/api/players/:teamId', (req, res) => {
  const { teamId } = req.params;
  const filename = `players-${teamId}.json`;
  const data = readJsonFile(filename);
  res.json(data || []);
});

app.post('/api/players/:teamId', (req, res) => {
  const { teamId } = req.params;
  const players = req.body;
  const filename = `players-${teamId}.json`;
  if (writeJsonFile(filename, players)) {
    res.json({ success: true, players });
  } else {
    res.status(500).json({ error: 'Error saving players' });
  }
});

// Delete players file
app.delete('/api/players/:teamId', (req, res) => {
  const { teamId } = req.params;
  const filename = `players-${teamId}.json`;
  const filePath = path.join(dataDir, filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.json({ success: true, message: 'File already deleted' });
    }
  } catch (error) {
    console.error(`Error deleting ${filename}:`, error);
    res.status(500).json({ error: 'Error deleting players file' });
  }
});

// Serve static files from dist-web directory (AFTER API routes)
const distPath = path.join(__dirname, '..', 'dist-web');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Sport Metadata Server running on http://localhost:${PORT}`);
  console.log(`📦 Serving static files from: ${distPath}`);
  console.log(`💾 Data directory: ${dataDir}`);
});
