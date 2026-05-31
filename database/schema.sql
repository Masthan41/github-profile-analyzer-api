CREATE DATABASE IF NOT EXISTS github_profile_analyzer;

USE github_profile_analyzer;

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
);
