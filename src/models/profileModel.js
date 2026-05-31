const { pool } = require('../config/db');

const jsonFields = ['languages', 'most_starred_repo', 'recent_repo', 'insights'];

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function mapProfile(row) {
  if (!row) return null;

  return {
    ...row,
    languages: parseJson(row.languages),
    most_starred_repo: parseJson(row.most_starred_repo),
    recent_repo: parseJson(row.recent_repo),
    insights: parseJson(row.insights)
  };
}

function prepareProfile(profile) {
  const prepared = { ...profile };

  jsonFields.forEach((field) => {
    prepared[field] = profile[field] ? JSON.stringify(profile[field]) : null;
  });

  return prepared;
}

async function upsertProfile(profile) {
  const data = prepareProfile(profile);

  await pool.query(
    `
      INSERT INTO github_profiles (
        github_id, username, name, bio, company, blog, location, email,
        avatar_url, profile_url, public_repos, public_gists, followers, following,
        account_created_at, account_updated_at, account_age_days, total_stars,
        total_forks, fetched_repositories, top_language, languages,
        most_starred_repo, recent_repo, insights, analyzed_at
      )
      VALUES (
        :github_id, :username, :name, :bio, :company, :blog, :location, :email,
        :avatar_url, :profile_url, :public_repos, :public_gists, :followers, :following,
        :account_created_at, :account_updated_at, :account_age_days, :total_stars,
        :total_forks, :fetched_repositories, :top_language, :languages,
        :most_starred_repo, :recent_repo, :insights, CURRENT_TIMESTAMP
      )
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        name = VALUES(name),
        bio = VALUES(bio),
        company = VALUES(company),
        blog = VALUES(blog),
        location = VALUES(location),
        email = VALUES(email),
        avatar_url = VALUES(avatar_url),
        profile_url = VALUES(profile_url),
        public_repos = VALUES(public_repos),
        public_gists = VALUES(public_gists),
        followers = VALUES(followers),
        following = VALUES(following),
        account_updated_at = VALUES(account_updated_at),
        account_age_days = VALUES(account_age_days),
        total_stars = VALUES(total_stars),
        total_forks = VALUES(total_forks),
        fetched_repositories = VALUES(fetched_repositories),
        top_language = VALUES(top_language),
        languages = VALUES(languages),
        most_starred_repo = VALUES(most_starred_repo),
        recent_repo = VALUES(recent_repo),
        insights = VALUES(insights),
        analyzed_at = CURRENT_TIMESTAMP
    `,
    data
  );

  return findProfileByUsername(profile.username);
}

async function findAllProfiles({ page = 1, limit = 20, search = '' } = {}) {
  const offset = (page - 1) * limit;
  const params = {
    limit,
    offset,
    search: `%${search}%`
  };
  const whereClause = search ? 'WHERE username LIKE :search OR name LIKE :search' : '';

  const [rows] = await pool.query(
    `
      SELECT *
      FROM github_profiles
      ${whereClause}
      ORDER BY analyzed_at DESC
      LIMIT :limit OFFSET :offset
    `,
    params
  );

  const [[countRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM github_profiles
      ${whereClause}
    `,
    params
  );

  return {
    data: rows.map(mapProfile),
    pagination: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit)
    }
  };
}

async function findProfileByUsername(username) {
  const [rows] = await pool.query(
    'SELECT * FROM github_profiles WHERE username = :username LIMIT 1',
    { username }
  );

  return mapProfile(rows[0]);
}

async function deleteProfileByUsername(username) {
  const [result] = await pool.query('DELETE FROM github_profiles WHERE username = :username', {
    username
  });

  return result.affectedRows > 0;
}

module.exports = {
  upsertProfile,
  findAllProfiles,
  findProfileByUsername,
  deleteProfileByUsername
};
