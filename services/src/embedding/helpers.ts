import { getOpenAiClient } from '../openAI/helpers';

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
