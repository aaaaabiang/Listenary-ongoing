// const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
// const cors = require("cors")({ origin: true });
const axios = require("axios");
const Parser = require("rss-parser"); // 引入 rss-parser
const AZURE_API_KEY = //临时，正式使用环境变量
  "AQnGvGegFW18i0ViKLeI9B3Ujh04CciXFqntFfKLNuP93h8BjWUxJQQJ99BCACi5YpzXJ3w3AAAYACOGEm8J";

admin.initializeApp();

//proxy
exports.proxy = onRequest({ cors: true }, async function (req, res) {
  // cors(req, res, async () => {
  //   setCorsHeaders(res);
  //   if (req.method === "OPTIONS") {
  //     return res.status(204).send("");
  //   }

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
  // });
  console.log("Incoming headers:", req.headers);
});

// Translation API Cloud Function
exports.translate = onRequest({ cors: true }, async function (req, res) {
  // Enable CORS
  // cors(req, res, async () => {
  //   // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // 直接使用硬编码的API密钥，与前端使用的相同
    const DEEPL_API_KEY = "8dd9ce8e-032f-42ed-af73-c2de472febbf:fx";
    console.log("Using API key:", DEEPL_API_KEY.substr(0, 10) + "...");

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

    //     // Return translation results
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
  // });
});

// RSS Parser
exports.parseRssFeed = onRequest({ cors: true }, async function (req, res) {
  // setCorsHeaders(res);
  // if (req.method === "OPTIONS") {
  //   return res.status(204).send("");
  // }

  const rssUrl = req.query.url;

  if (!rssUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  // axios
  //   .get(rssUrl, { responseType: "text" })
  //   .then(async (response) => {
  try {
    // // 使用 axios 获取 RSS 数据
    const response = await axios.get(rssUrl, {
      responseType: "text", // 确保返回的是文本数据（如 RSS XML）
    });

    // 使用 rss-parser 解析 RSS 数据
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

    // 返回解析后的数据
    // res.status(200).json(
    const result = {
      feed: {
        title: feed.title,
        description: feed.description,
        image: feed.image?.url,
        link: feed.link,
      },
      items: feed.items.map(function(item) {
        return {
          title: item.title,
          description: item.contentSnippet || item.description,
          pubDate: item.pubDate || item.isoDate,
          // duration: item.itunes?.duration,//时长无法显示
          duration: formatDuration(item.itunes?.duration),
          episode: item.itunes?.episode,
          season: item.itunes?.season,
          image: item.itunes?.image || feed.image?.url,
          guid: item.guid,
          link: item.link,
          enclosure: item.enclosure,
        };
      }),
    };
    res.status(200).json(result);
  } catch (error) {
    console.error("Error parsing RSS feed:", error.message);
    // setCorsHeaders(res);
    res.status(500).send("Failed to parse RSS feed");
  }
});

function formatDuration(duration) {
  if (!duration) return "Unknown";

  if (typeof duration === "number") {
    const m = Math.floor(duration / 60);
    const s = duration % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (typeof duration === "string") {
    if (/^\d+$/.test(duration)) {
      // 纯数字秒数
      return formatDuration(Number(duration));
    }
    if (
      /^\d{1,2}:\d{2}$/.test(duration) ||
      /^\d{1,2}:\d{2}:\d{2}$/.test(duration)
    ) {
      // 已是标准格式
      return duration;
    }
  }

  return "Unknown";
}

// downloadAudio
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
