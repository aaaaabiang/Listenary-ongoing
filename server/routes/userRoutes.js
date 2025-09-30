// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { 
  getUserProfile,
  getWordlist, 
  addWordToWordlist,
  deleteWordFromWordlist,
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// --- Profile Routes ---
router.get('/profile', authMiddleware, getUserProfile);
router.get('/wordlist', authMiddleware, getWordlist);
router.post('/wordlist', authMiddleware, addWordToWordlist);
router.delete('/wordlist/:word', authMiddleware, deleteWordFromWordlist);


module.exports = router;