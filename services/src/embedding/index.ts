import express from 'express';
import { Configuration, OpenAIApi } from 'openai';

let _openAiClient: OpenAIApi | undefined;

const getOpenAiClient = () => {
  if (!_openAiClient) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    _openAiClient = new OpenAIApi(configuration);

    return _openAiClient;
  } else {
    return _openAiClient;
  }
};

/**
 * EXAMPLE API RESPONSE
 * {
 *   "object": "list",
 *   "data": [
 *     {
 *       "object": "embedding",
 *       "embedding": [
 *         0.0023064255,
 *         -0.009327292,
 *         .... (1536 floats total for ada-002)
 *         -0.0028842222,
 *       ],
 *       "index": 0
 *     }
 *   ],
 *   "model": "text-embedding-ada-002",
 *   "usage": {
 *     "prompt_tokens": 8,
 *     "total_tokens": 8
 *   }
 * }
 */

export const createEmbedding = async (text: string) => {
  const openAiClient = await getOpenAiClient();

  let embedding;

  try {
    embedding = await openAiClient?.createEmbedding({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: text,
    });
  } catch (error: any) {
    console.log({ message: error.message });
  }

  return embedding?.data?.data[0];
};

export const createEmbeddings = async (textArray: string[]) => {
  const openAiClient = await getOpenAiClient();

  let embedding;

  try {
    embedding = await openAiClient?.createEmbedding({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: textArray,
    });
  } catch (error: any) {
    console.log({ message: error.message });
  }

  return embedding?.data?.data;
};

export const embeddingRouter = express.Router();

embeddingRouter.post('/create', async (req, res) => {
  const { text } = req.body;

  const embedding = await createEmbedding(text);

  res.json({ data: embedding?.embedding });
  // res.send('Okay');
});
