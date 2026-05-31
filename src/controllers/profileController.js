const githubService = require('../services/githubService');
const profileModel = require('../models/profileModel');

function normalizeUsername(username) {
  return String(username || '').trim().replace(/^@/, '').toLowerCase();
}

function validateUsername(username) {
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username);
}

async function analyzeProfile(req, res, next) {
  try {
    const username = normalizeUsername(req.body.username);

    if (!username || !validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'A valid GitHub username is required.'
      });
    }

    const analysis = await githubService.analyzeGitHubProfile(username);
    const savedProfile = await profileModel.upsertProfile(analysis);

    return res.status(201).json({
      success: true,
      message: 'GitHub profile analyzed and stored successfully.',
      data: savedProfile
    });
  } catch (error) {
    next(error);
  }
}

async function getAllProfiles(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const profiles = await profileModel.findAllProfiles({ page, limit, search });

    res.json({
      success: true,
      ...profiles
    });
  } catch (error) {
    next(error);
  }
}

async function getProfileByUsername(req, res, next) {
  try {
    const username = normalizeUsername(req.params.username);
    const profile = await profileModel.findProfileByUsername(username);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Analyzed profile not found.'
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProfileByUsername(req, res, next) {
  try {
    const username = normalizeUsername(req.params.username);
    const deleted = await profileModel.deleteProfileByUsername(username);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Analyzed profile not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Analyzed profile deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
  deleteProfileByUsername
};
