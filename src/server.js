const app = require('./app');
const { ensureDatabaseExists, testConnection, ensureDatabaseSchema } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await ensureDatabaseExists();
    await testConnection();
    await ensureDatabaseSchema();

    app.listen(PORT, () => {
      console.log(`GitHub Profile Analyzer API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
