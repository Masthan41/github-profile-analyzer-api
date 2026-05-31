const mysql = require('mysql2/promise');

function parseMysqlUrl(url) {
  if (!url) return {};

  try {
    const parsed = new URL(url);

    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username || ''),
      password: decodeURIComponent(parsed.password || ''),
      database: parsed.pathname.replace(/^\//, '')
    };
  } catch {
    return {};
  }
}

const mysqlUrlConfig = parseMysqlUrl(process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL);
const databaseName =
  process.env.DB_NAME ||
  process.env.MYSQLDATABASE ||
  mysqlUrlConfig.database ||
  'github_profile_analyzer';

const baseConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || mysqlUrlConfig.host || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || mysqlUrlConfig.port || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || mysqlUrlConfig.user || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || mysqlUrlConfig.password || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
};

const dbConfig = {
  ...baseConfig,
  database: databaseName
};

const pool = mysql.createPool(dbConfig);

function logDatabaseConfig() {
  const configuredHost =
    process.env.DB_HOST ||
    process.env.MYSQLHOST ||
    mysqlUrlConfig.host ||
    '(missing, using localhost fallback)';

  console.log(`Database host configured as: ${configuredHost}`);
  console.log(`Database name configured as: ${databaseName}`);
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection(baseConfig);
  const safeDatabaseName = databaseName.replace(/`/g, '``');

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDatabaseName}\``);
  } finally {
    await connection.end();
  }
}

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('Connected to MySQL database');
  } finally {
    connection.release();
  }
}

async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS github_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      github_id BIGINT NOT NULL UNIQUE,
      username VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255),
      bio TEXT,
      company VARCHAR(255),
      blog VARCHAR(500),
      location VARCHAR(255),
      email VARCHAR(255),
      avatar_url VARCHAR(500),
      profile_url VARCHAR(500) NOT NULL,
      public_repos INT NOT NULL DEFAULT 0,
      public_gists INT NOT NULL DEFAULT 0,
      followers INT NOT NULL DEFAULT 0,
      following INT NOT NULL DEFAULT 0,
      account_created_at DATETIME NOT NULL,
      account_updated_at DATETIME,
      account_age_days INT NOT NULL DEFAULT 0,
      total_stars INT NOT NULL DEFAULT 0,
      total_forks INT NOT NULL DEFAULT 0,
      fetched_repositories INT NOT NULL DEFAULT 0,
      top_language VARCHAR(100),
      languages JSON,
      most_starred_repo JSON,
      recent_repo JSON,
      insights JSON,
      analyzed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_followers (followers),
      INDEX idx_public_repos (public_repos),
      INDEX idx_analyzed_at (analyzed_at)
    )
  `);
}

module.exports = {
  pool,
  ensureDatabaseExists,
  logDatabaseConfig,
  testConnection,
  ensureDatabaseSchema
};
