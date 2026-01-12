const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { login, verifyToken, authMiddleware, isLocalhost } = require('./auth.cjs');
const { validateSports, validateMatches, validateTeams, validatePlayers } = require('./validation.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Data directory for JSON files
const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Created data directory: ${dataDir}`);
} else {
  console.log(`📁 Using existing data directory: ${dataDir}`);
  // List existing files
  try {
    const files = fs.readdirSync(dataDir);
    console.log(`📁 Existing data files: ${files.join(', ') || 'none'}`);
  } catch (error) {
    console.error('❌ Error reading data directory:', error);
  }
}

// Helper function to read JSON file
const readJsonFile = (filename) => {
  const filePath = path.join(dataDir, filename);
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`📄 File ${filename} does not exist, returning empty array`);
      return []; // Return empty array instead of null
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    console.log(`📄 Read ${filename}: ${Array.isArray(parsed) ? parsed.length : 'non-array'} items`);
    return parsed;
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error);
    return []; // Return empty array on error
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

// Logging middleware for API routes
app.use('/api', (req, res, next) => {
  console.log(`📡 API ${req.method} ${req.path}`);
  next();
});

// ============ AUTH ROUTES ============

// Admin login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const result = login(password);
  if (result.success) {
    console.log(`🔐 Admin login successful${result.localhost ? ' (localhost mode)' : ''}`);
    res.json(result);
  } else {
    console.log('❌ Admin login failed');
    res.status(401).json(result);
  }
});

// Verify token
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false, localhost: isLocalhost });
  }
  const token = authHeader.substring(7);
  const result = verifyToken(token);
  res.json({ valid: result.valid, localhost: isLocalhost });
});

// ============ DATA ROUTES ============

// Sports
app.get('/api/sports', (req, res) => {
  console.log('📥 GET /api/sports');
  const data = readJsonFile('sports.json');
  console.log(`📤 Returning ${Array.isArray(data) ? data.length : 0} sports`);
  res.json(data || []);
});

app.post('/api/sports', authMiddleware, (req, res) => {
  console.log('📥 POST /api/sports', req.body);
  const sports = req.body;
  
  // Validate data
  const validation = validateSports(sports);
  if (!validation.valid) {
    console.error('❌ Validation error:', validation.error);
    return res.status(400).json({ error: validation.error });
  }
  
  if (writeJsonFile('sports.json', validation.data)) {
    console.log('✅ Sports saved successfully');
    res.json({ success: true, sports: validation.data });
  } else {
    console.error('❌ Error saving sports');
    res.status(500).json({ error: 'Error saving sports' });
  }
});

// Matches
app.get('/api/matches', (req, res) => {
  console.log('📥 GET /api/matches');
  const data = readJsonFile('matches.json');
  console.log(`📤 Returning ${Array.isArray(data) ? data.length : 0} matches`);
  res.json(data || []);
});

app.post('/api/matches', authMiddleware, (req, res) => {
  console.log('📥 POST /api/matches', req.body);
  const matches = req.body;
  
  // Validate data
  const validation = validateMatches(matches);
  if (!validation.valid) {
    console.error('❌ Validation error:', validation.error);
    return res.status(400).json({ error: validation.error });
  }
  
  if (writeJsonFile('matches.json', validation.data)) {
    console.log('✅ Matches saved successfully');
    res.json({ success: true, matches: validation.data });
  } else {
    console.error('❌ Error saving matches');
    res.status(500).json({ error: 'Error saving matches' });
  }
});

// Teams
app.get('/api/teams', (req, res) => {
  console.log('📥 GET /api/teams');
  const data = readJsonFile('teams.json');
  console.log(`📤 Returning ${Array.isArray(data) ? data.length : 0} teams`);
  res.json(data || []);
});

app.post('/api/teams', authMiddleware, (req, res) => {
  console.log('📥 POST /api/teams', req.body);
  const teams = req.body;
  
  // Check if any team has logo before validation
  const teamWithLogo = teams.find(t => t.logo);
  if (teamWithLogo) {
    console.log('🔍 Team with logo in request:', teamWithLogo.id, teamWithLogo.name, 'logo length:', teamWithLogo.logo?.length || 0);
  }
  
  // Validate data
  const validation = validateTeams(teams);
  if (!validation.valid) {
    console.error('❌ Validation error:', validation.error);
    return res.status(400).json({ error: validation.error });
  }
  
  // Check if validated data has logo
  const validatedTeamWithLogo = validation.data.find(t => t.logo);
  if (validatedTeamWithLogo) {
    console.log('🔍 Team with logo after validation:', validatedTeamWithLogo.id, validatedTeamWithLogo.name, 'logo length:', validatedTeamWithLogo.logo?.length || 0);
  } else if (teamWithLogo) {
    console.error('❌ Logo was lost during validation!');
  }
  
  if (writeJsonFile('teams.json', validation.data)) {
    console.log('✅ Teams saved successfully');
    res.json({ success: true, teams: validation.data });
  } else {
    console.error('❌ Error saving teams');
    res.status(500).json({ error: 'Error saving teams' });
  }
});

// Players
app.get('/api/players/:teamId', (req, res) => {
  const { teamId } = req.params;
  console.log(`📥 GET /api/players/${teamId}`);
  const filename = `players-${teamId}.json`;
  const data = readJsonFile(filename);
  console.log(`📤 Returning ${Array.isArray(data) ? data.length : 0} players for team ${teamId}`);
  res.json(data || []);
});

app.post('/api/players/:teamId', authMiddleware, (req, res) => {
  const { teamId } = req.params;
  console.log(`📥 POST /api/players/${teamId}`, req.body);
  const players = req.body;
  
  // Validate data
  const validation = validatePlayers(players);
  if (!validation.valid) {
    console.error('❌ Validation error:', validation.error);
    return res.status(400).json({ error: validation.error });
  }
  
  const filename = `players-${teamId}.json`;
  if (writeJsonFile(filename, validation.data)) {
    console.log(`✅ Players saved successfully for team ${teamId}`);
    res.json({ success: true, players: validation.data });
  } else {
    console.error(`❌ Error saving players for team ${teamId}`);
    res.status(500).json({ error: 'Error saving players' });
  }
});

// Delete players file
app.delete('/api/players/:teamId', authMiddleware, (req, res) => {
  const { teamId } = req.params;
  const filename = `players-${teamId}.json`;
  const filePath = path.join(dataDir, filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Players file deleted for team ${teamId}`);
      res.json({ success: true });
    } else {
      res.json({ success: true, message: 'File already deleted' });
    }
  } catch (error) {
    console.error(`Error deleting ${filename}:`, error);
    res.status(500).json({ error: 'Error deleting players file' });
  }
});

// Health check endpoint for Fly.io (BEFORE static files)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from dist-web directory (AFTER API routes and health check)
const distPath = path.join(__dirname, '..', 'dist-web');
console.log(`📁 Checking for dist-web at: ${distPath}`);
console.log(`📁 dist-web exists: ${fs.existsSync(distPath)}`);

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`📁 Files in dist-web: ${files.join(', ')}`);
  
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.get(/^(?!\/api|\/health).*/, (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    console.log(`📄 Serving index.html for: ${req.path}`);
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  });
} else {
  console.error(`❌ ERROR: dist-web directory not found at ${distPath}`);
  app.get(/^(?!\/api|\/health).*/, (req, res) => {
    res.status(500).send('Frontend build not found. Please check server logs.');
  });
}

// Serve favicon and other public assets (favicon is copied to dist-web during build, but serve from public as backup)
const publicPath = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sport Metadata Server running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Serving static files from: ${distPath}`);
  console.log(`💾 Data directory: ${dataDir}`);
});
