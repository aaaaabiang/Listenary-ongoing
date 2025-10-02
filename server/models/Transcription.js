// server/models/Transcription.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transcriptionSchema = new Schema({
  // userId 字段，类型是 ObjectId，并且引用 'User' 模型
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // 'ref' 告诉 Mongoose 这个字段关联到了 User 模型
  },
  episodeId: { // 来自 RSS 的 guid
    type: String,
    required: true,
    index: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'done', 'error'],
    default: 'pending'
  },
  resultText: {
    type: String,
    default: ''
  },
  phrases: [Object],
  // 可选字段，用于展示历史记录
  rssUrl: String,
  title: String,

}, {
  timestamps: true
});

// 创建一个复合索引，确保一个用户对一个 episode 只能有一条转录记录
transcriptionSchema.index({ userId: 1, episodeId: 1 }, { unique: true });

const Transcription = mongoose.model('Transcription', transcriptionSchema);
module.exports = Transcription;