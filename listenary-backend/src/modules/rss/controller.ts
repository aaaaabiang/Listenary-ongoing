//controller.ts — Express 路由层，接收请求、校验、调用 service、返回 HTTP 响应
import express from "express";
import {
  createSubscription,
  listSubscriptions,
  deleteSubscription,
  fetchAndPersistFeed,
  listItemsBySubscription,
  fetchFeedFromUrl
} from "./service";
import { validateRssUrl } from "../../middleware/validationMiddleware";

const router = express.Router();

// POST /api/rss/subscriptions  -> 创建订阅 
router.post("/subscriptions", validateRssUrl, async (req, res) => {
  try {
    const { url, title } = req.body;
    const sub = await createSubscription(url, title);
    res.status(201).json(sub);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rss/subscriptions -> 列出订阅 
router.get("/subscriptions", async (req, res) => {
  const subs = await listSubscriptions();
  res.json(subs);
});

// DELETE /api/rss/subscriptions/:id -> 删除订阅及其条目 
router.delete("/subscriptions/:id", async (req, res) => {
  try {
    await deleteSubscription(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rss/fetch?url=... -> 立刻解析并返回（不持久化）
router.get("/fetch", (req, res, next) => {
  const url = String(req.query.url || "");
  if (!url) return res.status(400).json({ message: "url required" });
  
  // 将query参数转换为body参数以使用验证中间件
  req.body = { url };
  next();
}, validateRssUrl, async (req, res) => {
  try {
    const result = await fetchFeedFromUrl(req.body.url);
    res.json(result);
  } catch (err: any) {
    console.error("Fetch error:", err);
    res.status(502).json({ message: "Failed to fetch feed", detail: err.message });
  }
});

// POST /api/rss/subscriptions/:id/fetch-and-save -> 抓取并持久化 
router.post("/subscriptions/:id/fetch-and-save", async (req, res) => {
  try {
    const result = await fetchAndPersistFeed(req.params.id);
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rss/subscriptions/:id/items -> 列出 DB 中该订阅的条目  前端后续调用
router.get("/subscriptions/:id/items", async (req, res) => {
  try {
    const items = await listItemsBySubscription(req.params.id, Number(req.query.limit || 50));
    res.json(items);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// test
router.get("/test", (req, res) => {
  res.json({ message: "RSS route OK" });
});

export default router;