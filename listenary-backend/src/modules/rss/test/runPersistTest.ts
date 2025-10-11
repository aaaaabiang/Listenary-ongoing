import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { createSubscription, fetchAndPersistFeed, listSubscriptions, listItemsBySubscription } from "../service";

async function main() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/listenary_rss_test";
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  try {
    // 1) 创建订阅（或返回已存在）
    const url = process.argv[2] || "https://feeds.bbci.co.uk/news/rss.xml";
    const sub = await createSubscription(url, "Test Feed");
    console.log("Subscription:", { id: sub._id ?? sub.id, url: sub.url });

    // 2) 抓取并持久化
    const result = await fetchAndPersistFeed(sub._id ?? sub.id);
    console.log("Fetch result feedMeta:", result.feedMeta);
    console.log("Saved item count (attempted):", result.saved?.length ?? 0);

    // 3) 从 DB 读取最近几条
    const items = await listItemsBySubscription(sub._id ?? sub.id, 5);
    console.log("Items in DB (first 5):", items.map(it => ({ guid: it.guid, title: it.title, pubDate: it.pubDate })));

    process.exit(0);
  } catch (err:any) {
    console.error("Persist test failed:", err.message ?? err);
    process.exit(2);
  } finally {
    // optional: await mongoose.disconnect();
  }
}

main();
