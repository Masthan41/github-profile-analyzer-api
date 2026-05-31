require('dotenv').config();

const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GitHub Profile Analyzer API',
    endpoints: {
      health: 'GET /health',
      analyzeProfile: 'POST /api/profiles/analyze',
      listProfiles: 'GET /api/profiles',
      getProfile: 'GET /api/profiles/:username'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/profiles', profileRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
