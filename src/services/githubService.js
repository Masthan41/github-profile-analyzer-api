const GITHUB_API_BASE_URL = 'https://api.github.com';

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-profile-analyzer-api',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubRequest(path) {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: githubHeaders()
  });

  if (response.status === 404) {
    const error = new Error('GitHub user not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || 'GitHub API request failed.');
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

async function fetchRepositories(username) {
  const pageLimit = Math.max(Number(process.env.GITHUB_REPO_PAGE_LIMIT || 3), 1);
  const repositories = [];

  for (let page = 1; page <= pageLimit; page += 1) {
    const repoPage = await githubRequest(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`
    );

    repositories.push(...repoPage);

    if (repoPage.length < 100) {
      break;
    }
  }

  return repositories;
}

function daysSince(dateString) {
  const createdAt = new Date(dateString);
  const diffMs = Date.now() - createdAt.getTime();
  return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);
}

function toMysqlDateTime(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
}

function buildLanguageSummary(repositories) {
  return repositories.reduce((summary, repo) => {
    if (!repo.language) return summary;
    summary[repo.language] = (summary[repo.language] || 0) + 1;
    return summary;
  }, {});
}

function buildInsights(user, repositories) {
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = buildLanguageSummary(repositories);
  const topLanguage = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostStarredRepo = repositories
    .slice()
    .sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  const recentRepo = repositories
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

  return {
    github_id: user.id,
    username: user.login.toLowerCase(),
    name: user.name,
    bio: user.bio,
    company: user.company,
    blog: user.blog,
    location: user.location,
    email: user.email,
    avatar_url: user.avatar_url,
    profile_url: user.html_url,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    account_created_at: toMysqlDateTime(user.created_at),
    account_updated_at: toMysqlDateTime(user.updated_at),
    account_age_days: daysSince(user.created_at),
    total_stars: totalStars,
    total_forks: totalForks,
    fetched_repositories: repositories.length,
    top_language: topLanguage,
    languages,
    most_starred_repo: mostStarredRepo
      ? {
          name: mostStarredRepo.name,
          url: mostStarredRepo.html_url,
          stars: mostStarredRepo.stargazers_count,
          forks: mostStarredRepo.forks_count,
          language: mostStarredRepo.language,
          description: mostStarredRepo.description
        }
      : null,
    recent_repo: recentRepo
      ? {
          name: recentRepo.name,
          url: recentRepo.html_url,
          updated_at: recentRepo.updated_at,
          language: recentRepo.language,
          description: recentRepo.description
        }
      : null,
    insights: {
      follower_to_following_ratio:
        user.following > 0 ? Number((user.followers / user.following).toFixed(2)) : user.followers,
      average_stars_per_fetched_repo:
        repositories.length > 0 ? Number((totalStars / repositories.length).toFixed(2)) : 0,
      repository_density:
        user.public_repos > 50 ? 'high' : user.public_repos > 10 ? 'moderate' : 'low',
      profile_completeness_score: [
        user.name,
        user.bio,
        user.company,
        user.location,
        user.blog,
        user.email,
        user.avatar_url
      ].filter(Boolean).length
    }
  };
}

async function analyzeGitHubProfile(username) {
  const user = await githubRequest(`/users/${encodeURIComponent(username)}`);
  const repositories = await fetchRepositories(user.login);
  return buildInsights(user, repositories);
}

module.exports = {
  analyzeGitHubProfile
};
