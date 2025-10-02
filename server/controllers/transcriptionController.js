// server/controllers/transcriptionController.js
const Transcription = require('../models/Transcription');
// 我们之后会在这里添加调用 Azure API 的逻辑

/**
 * @desc    创建一个新的转录任务
 * @route   POST /api/transcriptions
 * @access  Private
 */
const createTranscription = async (req, res) => {
  const { episodeId, audioUrl, rssUrl, title } = req.body;

  // 检查必要字段
  if (!episodeId || !audioUrl) {
    return res.status(400).json({ message: 'episodeId and audioUrl are required' });
  }

  try {
    // 创建一个新的转录任务记录，初始状态为 'pending'
    const newTranscription = await Transcription.create({
      userId: req.user._id, // 从 authMiddleware 获取用户ID
      episodeId,
      audioUrl,
      rssUrl,
      title,
      status: 'pending', // 初始状态
    });

    // TODO: 在这里触发真正的异步转录过程 (调用 Azure API)
    // 这是一个高级主题 (任务队列)，我们暂时只创建记录。
    
    console.log(`已为用户 ${req.user.email} 创建转录任务: ${newTranscription._id}`);

    res.status(201).json(newTranscription);
  } catch (error) {
    // 如果因为复合唯一索引导致创建失败 (任务已存在)，会进入这里
    if (error.code === 11000) {
      return res.status(409).json({ message: '你已经转录过这个单集了' });
    }
    res.status(500).json({ message: '创建转录任务失败', error: error.message });
  }
};

/**
 * @desc    根据 ID 获取一个转录任务的状态和结果
 * @route   GET /api/transcriptions/:id
 * @access  Private
 */
const getTranscriptionById = async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({ message: '转录任务未找到' });
    }

    // 安全检查：确保只有任务的创建者才能查看它
    if (transcription.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    res.status(200).json(transcription);
  } catch (error) {
    res.status(500).json({ message: '获取转录任务失败', error: error.message });
  }
};

module.exports = { createTranscription, getTranscriptionById };
