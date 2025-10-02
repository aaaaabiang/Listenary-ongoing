// server/routes/transcriptionRoutes.js
const express = require('express');
const router = express.Router();
const { createTranscription, getTranscriptionById } = require('../controllers/transcriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// 保护此文件中的所有路由
router.use(authMiddleware);

// 创建新任务
router.post('/', createTranscription);
// 根据 ID 查询任务
router.get('/:id', getTranscriptionById);

module.exports = router;