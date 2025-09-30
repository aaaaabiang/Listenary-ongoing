// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { 
  getUserProfile,
  getWordlist, 
  addWordToWordlist,
  deleteWordFromWordlist,
  getSavedPodcasts,
  addSavedPodcast,
  removeSavedPodcast,
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// 【关键】将 authMiddleware 应用于此文件中的所有后续路由
router.use(authMiddleware);

// --- 现在，下面所有的路由都自动被保护了，无需再单独添加 ---

// Profile Routes
router.get('/profile', getUserProfile);

// Wordlist Routes
router.get('/wordlist', getWordlist);
router.post('/wordlist', addWordToWordlist);
router.delete('/wordlist/:word', deleteWordFromWordlist);

// Saved Podcast Routes
router.get('/podcasts', getSavedPodcasts);
router.post('/podcasts', addSavedPodcast);
router.delete('/podcasts', removeSavedPodcast);

module.exports = router;