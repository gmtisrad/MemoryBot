import express from 'express';
import { createEmbedding } from '../embedding';
import { similaritySearch } from '../vector_db';
import { createCompletion } from '../completion';

export const appRouter = express.Router();

appRouter.post('/searchEmbedding', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  // console.log({ embeddingSearchResponse });

  res.json({ embeddingSearchResponse });
});

appRouter.post('/promptRequest', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);
  console.log('promptRequest - created embedding');

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });
  console.log('promptRequest - embeddingSearchResponse');

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );
  console.log('promptRequest - similarChunks');

  const promptWithContext = `${similarChunks.join(
    '\r\n\n',
  )}\r\n\nPrompt: ${prompt}`;

  // console.log({ promptWithContext });

  const completion = await createCompletion(promptWithContext);
  console.log('promptRequest - createCompletion');

  // console.log({ embeddingSearchResponse });

  res.json({ completion });
});
