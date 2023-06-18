import express from 'express';
import { createCollection } from './mongoInit';
import { insertVectorDocumentEntry } from './helpers';

export const dbRouter = express.Router();

dbRouter.post('/insertVector', async (req, res) => {
  const { documentChunkEmbedding, documentChunkOriginal, vectorDBId } =
    req.body;

  const { acknowledged, insertedId } = await insertVectorDocumentEntry({
    documentChunkEmbedding,
    documentChunkOriginal,
    vectorDBId,
  });

  res.json({
    acknowledged,
    insertedId,
  });
});

dbRouter.post('/createCollection', async (req, res) => {
  const { collectionName } = req.body;

  await createCollection(collectionName);

  res.json({
    success: true,
  });
});
