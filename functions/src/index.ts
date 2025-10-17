// functions/src/index.ts

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const Parser = require("rss-parser");

// 在 Node.js 环境中，使用 process.env 获取环境变量
// 您需要在 Firebase Functions 的环境变量中设置这些值
const AZURE_API_KEY = process.env.VITE_AZURE_API_KEY;
const DEEPL_API_KEY = process.env.VITE_DEEPL_API_KEY;

admin.initializeApp();

// ==================== 新增的辅助函数 ====================
function normalizeImageUrl(imageData) {
  if (!imageData) {
    return undefined;
  }
  
  // Case 1: 本身就是 URL 字符串
  if (typeof imageData === 'string' && imageData.startsWith('http')) {
    return imageData;
  }
  
  // Case 2: 是一个数组
  if (Array.isArray(imageData) && imageData.length > 0) {
    // 递归处理数组的第一个元素，无论它是字符串还是对象
    return normalizeImageUrl(imageData[0]);
  }
  
  // Case 3: 是一个对象
  if (typeof imageData === 'object' && imageData !== null) {
    // 常见格式: { url: '...' }
    if (imageData.url && typeof imageData.url === 'string') {
      return imageData.url;
    }
    // iTunes 常见格式: { href: '...' }
    if (imageData.href && typeof imageData.href === 'string') {
      return imageData.href;
    }
    // 处理 rss-parser 解析 XML 属性时的格式: { $: { href: '...' } }
    if (imageData.$ && imageData.$.href && typeof imageData.$.href === 'string') {
      return imageData.$.href;
    }
  }
  
  // 如果所有尝试都失败，返回 undefined
  return undefined;
}

// proxy 函数 (保持不变)
exports.proxy = onRequest({ cors: true }, async function (req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }
  try {
    const axiosOptions = {
      method: req.method,
      url: targetUrl,
      headers: {
        "Content-Type": req.headers["content-type"],
        "Ocp-Apim-Subscription-Key": AZURE_API_KEY,
      },
      data: req.rawBody,
    };
    const response = await axios(axiosOptions);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", {
      message: error.message,
      code: error.code,
      config: error.config,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
    });
    res.status(500).send("Failed to fetch target URL");
  }
  console.log("Incoming headers:", req.headers);
});

// Translation API Cloud Function (保持不变)
exports.translate = onRequest({ cors: true }, async function (req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    console.log("Using API key:", DEEPL_API_KEY ? DEEPL_API_KEY.substr(0, 5) + "..." : "Not found");

    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      req.body,
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Translation error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(error.response?.status || 500).json({
      error: "Translation failed",
      details: error.response?.data || error.message,
    });
  }
});

// RSS Parser (已修改)
exports.parseRssFeed = onRequest({ cors: true }, async function (req, res) {
  const rssUrl = req.query.url;

  if (!rssUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  try {
    const response = await axios.get(rssUrl, {
      responseType: "text",
    });

    const parser = new Parser({
      customFields: {
        feed: ["image", "language", "copyright"],
        item: [
          "itunes:duration",
          "itunes:image",
          "itunes:episode",
          "itunes:season",
          "itunes:summary",
          "enclosure",
        ],
      },
    });
    const feed = await parser.parseString(response.data);

    // ==================== 修改的核心部分 ====================
    // 使用新的辅助函数来清洗图片 URL
    const channelImage = normalizeImageUrl(feed.image);

    const result = {
      feed: {
        title: feed.title,
        description: feed.description,
        image: channelImage, // <--- 使用清洗后的 URL
        link: feed.link,
      },
      items: feed.items.map(function (item) {
        // 同样为每一集的图片进行清洗
        // 如果单集没有自己的图片，则使用频道的封面图作为后备
        const itemImage = normalizeImageUrl(item.itunes?.image) || channelImage;

        return {
          title: item.title,
          description: item.contentSnippet || item.description,
          pubDate: item.pubDate || item.isoDate,
          duration: formatDuration(item.itunes?.duration),
          episode: item.itunes?.episode,
          season: item.itunes?.season,
          image: itemImage, // <--- 使用清洗后的 URL
          guid: item.guid,
          link: item.link,
          enclosure: item.enclosure,
        };
      }),
    };
    // ========================================================

    res.status(200).json(result);
  } catch (error) {
    console.error("Error parsing RSS feed:", error.message);
    res.status(500).send("Failed to parse RSS feed");
  }
});

// formatDuration 函数 (保持不变)
function formatDuration(duration) {
  if (!duration) return "Unknown";

  if (typeof duration === "number") {
    const m = Math.floor(duration / 60);
    const s = duration % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (typeof duration === "string") {
    if (/^\d+$/.test(duration)) {
      return formatDuration(Number(duration));
    }
    if (
      /^\d{1,2}:\d{2}$/.test(duration) ||
      /^\d{1,2}:\d{2}:\d{2}$/.test(duration)
    ) {
      return duration;
    }
  }

  return "Unknown";
}

// downloadAudio 函数 (保持不变)
exports.downloadAudio = onRequest({ cors: true }, async function (req, res) {
  const audioUrl = req.query.url;
  if (!audioUrl) return res.status(400).send("Missing audio URL");

  try {
    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    res.set("Content-Type", response.headers["content-type"]);
    res.status(200).send(response.data);
  } catch (err) {
    console.error("Download audio failed:", err.message);
    res.status(500).send("Failed to download audio");
  }
});

exports.proxyImage = onRequest({ cors: true }, async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).send("Missing 'url' query parameter");
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer', // 关键：以二进制形式获取图片数据
      headers: {
        // 伪装成一个普通的浏览器请求
        'Referer': new URL(imageUrl).origin, 
      }
    });

    // 将图片数据和原始的 Content-Type 头返回给前端
    res.set('Content-Type', response.headers['content-type']);
    res.status(200).send(response.data);
  } catch (err) {
    console.error("Image proxy failed:", err.message);
    res.status(502).send("Failed to proxy image");
  }
});