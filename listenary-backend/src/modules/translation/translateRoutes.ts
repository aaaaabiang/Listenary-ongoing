import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, target_lang } = req.body;
    if (!Array.isArray(text) || !target_lang) {
      return res.status(400).json({ error: 'Missing text[] or target_lang' });
    }
    const key = process.env.DEEPL_API_KEY;
    if (!key) return res.status(500).json({ error: 'DEEPL_API_KEY not set' });

    const r = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      { text, target_lang },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    res.json(r.data);
  } catch (e: any) {
    res.status(e.response?.status || 500).json({
      error: 'Translation failed',
      details: e.response?.data || e.message,
    });
  }
});

export { router as translateRoutes };
