// listenary-backend/src/modules/dictionary/dictionaryRoutes.ts
import express from 'express';
import { lookupWord } from './dictionaryController';

const router = express.Router();
router.get('/:word', lookupWord);

export { router as dictionaryRoutes };