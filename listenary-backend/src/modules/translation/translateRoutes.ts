import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, target_lang } = req.body;
    if (!Array.isArray(text) || !target_lang) {
      return res.status(400).json({ error: 'Missing text[] or target_lang' });
    }

    const apiKey = process.env.DEEPL_API_KEY; // 从环境变量读
    if (!apiKey) return res.status(500).json({ error: 'DEEPL_API_KEY not set' });

    const r = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      { text, target_lang },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    res.json(r.data);
  } catch (err: any) {
    console.error('DeepL error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Translation failed',
      details: err.response?.data || err.message,
    });
  }
});

export { router as translateRoutes };
