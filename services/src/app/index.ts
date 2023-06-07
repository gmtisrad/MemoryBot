import express from 'express';
import { createEmbedding } from '../embedding';
import { similaritySearch } from '../vector_db';

export const appRouter = express.Router();

appRouter.post('/searchEmbedding', async (req, res) => {
  const { prompt } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
  });

  // console.log({ embeddingSearchResponse });

  res.json({ embeddingSearchResponse });
});
