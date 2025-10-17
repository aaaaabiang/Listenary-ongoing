# Firebase 代码清理总结

## ✅ 已清理完成

### 前端文件

#### 1. `src/firestoreModel.ts`
- ❌ **已删除**：废弃的 Firestore 用户数据和单词本函数
  - `saveUserData()` - 已迁移到 MongoDB
  - `loadUserData()` - 已迁移到 MongoDB  
  - `getUserWordlist()` - 已迁移到 MongoDB
  - `saveWordToUserWordlist()` - 已迁移到 MongoDB
  - `deleteWordFromUserWordlist()` - 已迁移到 MongoDB
  - `connectToPersistence()` - 不再需要

- ✅ **保留**：Transcription 相关函数（待验证后可能迁移）
  - `saveTranscriptionData()` - 保存转录数据到 Firestore
  - `getTranscriptionData()` - 从 Firestore 获取转录数据

- ✅ **保留**：localStorage 缓存函数（不是 Firebase，是客户端缓存）
  - `savePodcastChannelInfo/loadPodcastChannelInfo`
  - `savePodcastEpisodes/loadPodcastEpisodes`
  - `saveRssUrl/loadRssUrl`
  - `saveAudioUrl/loadAudioUrl`

#### 2. `src/hooks/useTranscriptionSync.ts`
- ✅ 更新注释：从 "sync with Firestore" 改为 "sync with MongoDB"

#### 3. `src/Model.ts`
- ✅ 已移除废弃的 `persistUserData()` 方法
- ✅ 改用 MongoDB API：`addPodcastToSaved()`, `removePodcastFromSaved()`

#### 4. `src/index.tsx`
- ✅ 改用 `getSavedPodcasts()` 从 MongoDB 加载收藏播客

---

## ⚠️ 待验证（暂时保留）

### Transcription 相关
这些 Firestore 功能目前还在使用，需要先验证功能是否正常，再决定是否迁移到 MongoDB：

1. **前端 Firestore 调用**：
   - `src/firestoreModel.ts` - `saveTranscriptionData()`, `getTranscriptionData()`
   - `src/firebaseApp.ts` - Firebase 初始化和 Firestore db 实例

2. **后端 MongoDB 转录 API**（已存在但需验证）：
   - `listenary-backend/src/modules/transcription/` - 转录模块
   - `src/api/transcriptionAPI.tsx` - 前端 API 调用

**验证步骤**：
1. 测试转录功能是否正常工作
2. 检查转录数据是否正确保存和加载
3. 如果 MongoDB API 工作正常，则可以删除 Firestore 版本

---

## 🗑️ 可以考虑删除的文件

### Firebase Cloud Functions（已废弃）
`functions/` 文件夹中的 Cloud Functions 大部分已经不再使用：

#### 可以删除：
- ❌ `parseRssFeed` - RSS 解析已迁移到后端 (`listenary-backend/src/modules/rss/`)

#### 需要检查是否还在使用：
- ⚠️ `proxy` - 代理功能（需要检查是否还在用）
- ⚠️ `translate` - 翻译功能（需要检查后端是否已实现）
- ⚠️ `downloadAudio` - 音频下载（需要检查是否还在用）

**建议**：
1. 如果这些功能都已迁移到后端，可以删除整个 `functions/` 文件夹
2. 如果还在使用，建议逐步迁移到 `listenary-backend`

### Firebase 配置文件
- `firebase.json` - 如果不再使用 Firebase Hosting 和 Cloud Functions，可以删除

---

## ✅ 必须保留

### Firebase Authentication
这些文件必须保留，因为项目仍在使用 Firebase Authentication：

1. **前端**：
   - `src/firebaseApp.ts` - Firebase 初始化
   - `src/firebaseConfig.ts` - Firebase 配置
   - `src/loginModel.ts` - 登录逻辑
   - `src/services/authService.ts` - 认证服务

2. **后端**：
   - `listenary-backend/config/firebaseConfig.ts` - Firebase 配置
   - `listenary-backend/src/middleware/firebaseAdmin.ts` - Firebase Admin SDK
   - `listenary-backend/src/middleware/firebaseAuthMiddleware.ts` - 认证中间件

---

## 📊 迁移状态总结

| 功能 | Firestore | MongoDB | 状态 |
|------|----------|---------|------|
| 用户数据 (savedPodcasts) | ❌ 已废弃 | ✅ 已迁移 | ✅ 完成 |
| 单词本 (wordlist) | ❌ 已废弃 | ✅ 已迁移 | ✅ 完成 |
| RSS 解析 | ❌ 已废弃 | ✅ 已迁移 | ✅ 完成 |
| 转录数据 (transcription) | ⚠️ 使用中 | ⚠️ 待验证 | 🔄 进行中 |
| 用户认证 (Authentication) | ✅ 保留 | N/A | ✅ 保留 |
| 播客搜索 | N/A | ✅ 已实现 | ✅ 完成 |
| 字典查询 | N/A | ✅ 已实现 | ✅ 完成 |

---

## 🎯 下一步建议

1. **立即测试**：验证 savedPodcasts 功能是否正常（收藏、取消收藏、刷新后加载）
2. **验证 Transcription**：测试转录功能，确认数据保存和加载是否正常
3. **检查 Cloud Functions**：确认 `proxy`, `translate`, `downloadAudio` 是否还在使用
4. **清理 functions/**：如果 Cloud Functions 都已废弃，删除整个文件夹
5. **更新文档**：更新 README 以反映新的架构（MongoDB + Firebase Auth）

---

**清理完成时间**：2025-01-17  
**清理内容**：Firestore 用户数据和单词本相关代码  
**下一步**：验证 Transcription 功能后完成最终迁移

