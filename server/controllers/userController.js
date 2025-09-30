// server/controllers/userController.js
const User = require('../models/User');

/**
 * @desc    获取当前登录用户的个人资料。
 * @route   GET /api/user/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  // authMiddleware 已经把 user 信息附加到 req 上了
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: '用户未找到' });
  }
};

/**
 * @desc    【新增】获取当前用户的完整单词本。
 * @route   GET /api/user/wordlist
 * @access  Private
 */
const getWordlist = async (req, res) => {
  // req.user 就是从数据库查出来的、完整的用户文档
  res.status(200).json(req.user.wordlist);
};

/**
 * @desc    【新增】向当前用户的单词本添加一个新单词。
 * @route   POST /api/user/wordlist
 * @access  Private
 */
const addWordToWordlist = async (req, res) => {
  try {
    const wordData = req.body; // 从前端获取要添加的单词对象
    
    // 检查单词是否已存在，避免重复添加
    const wordExists = req.user.wordlist.find(item => item.word === wordData.word);
    if (wordExists) {
      return res.status(400).json({ message: '这个单词已经存在于你的单词本中' });
    }
    
    // 使用 .push() 方法将新单词添加到数组
    req.user.wordlist.push(wordData);
    
    // 保存对用户文档的修改
    await req.user.save();
    
    // 返回更新后的完整单词本
    res.status(201).json(req.user.wordlist);
  } catch (error) {
    res.status(500).json({ message: '添加单词失败', error: error.message });
  }
};

/**
 * @desc    【新增】从当前用户的单词本中删除一个单词。
 * @route   DELETE /api/user/wordlist/:word
 * @access  Private
 */
const deleteWordFromWordlist = async (req, res) => {
  try {
    const wordToDelete = req.params.word; // 从 URL 中获取要删除的单词

    // 使用 .filter() 方法创建一个不包含要删除单词的新数组
    req.user.wordlist = req.user.wordlist.filter(item => item.word !== wordToDelete);

    // 保存修改
    await req.user.save();

    // 返回更新后的单词本
    res.status(200).json(req.user.wordlist);
  } catch (error) {
    res.status(500).json({ message: '删除单词失败', error: error.message });
  }
};

/**
 * @desc    【新增】获取当前用户所有已保存的播客。
 * @route   GET /api/user/podcasts
 * @access  Private
 */
const getSavedPodcasts = async (req, res) => {
  res.status(200).json(req.user.savedPodcasts);
};

/**
 * @desc    【新增】向当前用户添加一个新的已保存播客。
 * @route   POST /api/user/podcasts
 * @access  Private
 */
const addSavedPodcast = async (req, res) => {
  try {
    const podcastData = req.body; // 从前端获取要添加的播客对象

    const podcastExists = req.user.savedPodcasts.find(p => p.rssUrl === podcastData.rssUrl);
    if (podcastExists) {
      return res.status(400).json({ message: '这个播客已经被保存了' });
    }

    req.user.savedPodcasts.push(podcastData);
    await req.user.save();
    res.status(201).json(req.user.savedPodcasts);
  } catch (error) {
    res.status(500).json({ message: '保存播客失败', error: error.message });
  }
};

/**
 * @desc    【新增】从当前用户中移除一个已保存的播客。
 * @route   DELETE /api/user/podcasts
 * @access  Private
 */
const removeSavedPodcast = async (req, res) => {
  try {
    const { rssUrl } = req.body; // 我们通过唯一的 rssUrl 来识别要删除哪个播客

    if (!rssUrl) {
        return res.status(400).json({ message: '需要提供播客的 rssUrl' });
    }

    req.user.savedPodcasts = req.user.savedPodcasts.filter(
      podcast => podcast.rssUrl !== rssUrl
    );

    await req.user.save();
    res.status(200).json(req.user.savedPodcasts);
  } catch (error) {
    res.status(500).json({ message: '移除播客失败', error: error.message });
  }
};


// 别忘了更新 module.exports
module.exports = { 
  getUserProfile,
  getWordlist,
  addWordToWordlist,
  deleteWordFromWordlist,
  getSavedPodcasts,
  addSavedPodcast,
  removeSavedPodcast,
};
