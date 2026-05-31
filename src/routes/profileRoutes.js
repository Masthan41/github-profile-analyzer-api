const express = require('express');
const {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
  deleteProfileByUsername
} = require('../controllers/profileController');

const router = express.Router();

router.post('/analyze', analyzeProfile);
router.get('/', getAllProfiles);
router.get('/:username', getProfileByUsername);
router.delete('/:username', deleteProfileByUsername);

module.exports = router;
