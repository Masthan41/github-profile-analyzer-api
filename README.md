# GitHub Profile Analyzer API

Backend service built with Node.js, Express.js, MySQL, and the GitHub public API. It analyzes a GitHub username, stores useful profile insights, and exposes APIs to list or fetch stored analyses.

## Features

- Fetch public GitHub profile data by username.
- Analyze profile stats including repositories, followers, account age, stars, forks, languages, most-starred repository, recent repository, and profile completeness.
- Store or update analysis results in MySQL.
- Fetch all analyzed profiles with pagination and search.
- Fetch a single analyzed profile by username.
- Delete a stored analysis.
- Optional GitHub token support for higher API rate limits.

## Tech Stack

- Node.js
- Express.js
- MySQL
- GitHub REST API

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a MySQL database:

```sql
CREATE DATABASE github_profile_analyzer;
```

You can also import the schema from [database/schema.sql](database/schema.sql).

3. Create your environment file:

```bash
cp .env.example .env
```

4. Update `.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_profile_analyzer
GITHUB_TOKEN=
GITHUB_REPO_PAGE_LIMIT=3
```

5. Start the API:

```bash
npm run dev
```

For production:

```bash
npm start
```

The API will run at:

```text
http://localhost:5000
```

## API Endpoints

### Health Check

```http
GET /health
```

### Analyze GitHub Profile

```http
POST /api/profiles/analyze
Content-Type: application/json

{
  "username": "octocat"
}
```

### Get All Stored Profiles

```http
GET /api/profiles?page=1&limit=20&search=octo
```

Query parameters:

- `page`: page number, default `1`
- `limit`: records per page, default `20`, max `100`
- `search`: optional search by username or name

### Get Single Stored Profile

```http
GET /api/profiles/octocat
```

### Delete Stored Profile

```http
DELETE /api/profiles/octocat
```

## Database Schema

Schema/export file is available at:

```text
database/schema.sql
```

Main table: `github_profiles`

Stored insights include:

- GitHub ID and username
- Name, bio, company, location, blog, avatar URL
- Public repositories and public gists
- Followers and following
- Account creation date and account age
- Total stars and forks from fetched repositories
- Top language and language distribution
- Most-starred repository
- Recently updated repository
- Extra insight metrics in JSON

## Postman Collection

Import this file into Postman:

```text
postman/GitHub_Profile_Analyzer_API.postman_collection.json
```

Set the `baseUrl` collection variable to your deployed API URL or local URL.

## Deployment Notes

For deployment, set these environment variables on your hosting provider:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `GITHUB_TOKEN` optional
- `GITHUB_REPO_PAGE_LIMIT` optional

Submission placeholders:

- GitHub repository link: add your repository URL here after pushing the code.
- Live deployed API URL: add your deployed API URL here after deployment.
