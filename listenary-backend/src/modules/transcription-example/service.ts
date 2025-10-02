// 	•	编写业务逻辑。
//	•	调用 Repository（数据库）或其他 Service。

// 示例代码：
// const userRepository = require('./user.repository');

// exports.getUserById = async (id) => {
//   const user = await userRepository.findById(id);
//   if (!user) throw new Error('User not found');
//   return user;
// };

export async function createTranscription(userId: string, rssUrl: string) {
  return {
    // 返回创建成功的转写任务信息（mock）
    id: "mock-transcription-id-1 from service",
    userId: userId,
    rssUrl: rssUrl,
    audioUrl: "https://example.com/audio.mp3",
    status: "processing",
  };
}
export async function getTranscriptionById(id: string) {
  // 暂时返回 mock，未来会查数据库
  return {
    id: id,
    userId: "mock-user-123 from service",
    rssUrl: "https://example.com/feed.xml",
    audioUrl: "https://example.com/audio.mp3",
    status: "done",
    resultText: "这是转写结果文本（mock）",
    createdAt: new Date().toISOString(),
  };
}
