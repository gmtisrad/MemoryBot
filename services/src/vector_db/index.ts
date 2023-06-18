import express from 'express';
import { insertDocumentEntry } from './helpers';

export const vectorDBRouter = express.Router();

vectorDBRouter.post('/create', async (req, res) => {
  const { documentChunkEmbedding, documentChunkOriginal } = req.body;

  const response = await insertDocumentEntry({
    documentChunkEmbedding,
    documentChunkOriginal,
  });

  res.json({
    status: response?.status,
    ids: response?.IDs,
    acknowledged: response?.acknowledged,
  });
});
