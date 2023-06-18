import express from 'express';
import { createEmbedding } from './helpers';

export const embeddingRouter = express.Router();

embeddingRouter.post('/create', async (req, res) => {
  const { text } = req.body;

  const embedding = await createEmbedding(text);

  res.json({ data: embedding?.embedding });
});
