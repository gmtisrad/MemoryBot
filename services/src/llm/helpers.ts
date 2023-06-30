import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { Document } from 'langchain/document';
import { getRecursiveSummarizeChunksPrompt } from '../langchain/templates';
import { splitBufferByToken } from '../langchain/documents';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';

let _openAiClient: OpenAIApi | undefined;

interface IRecursiveSummarizeChunks {
  documentChunks: Document[];
}

interface IRecursiveSummarizeBuffer {
  buffer: Buffer;
  fileName: string;
}

export const getOpenAiClient = () => {
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

export const createCompletion: (prompt: string) => any = async (
  prompt: string,
) => {
  const openAiClient = await getOpenAiClient();

  let completion;

  try {
    completion = await openAiClient?.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: ChatCompletionRequestMessageRoleEnum.User, content: prompt },
      ],
    });
  } catch (error: any) {
    console.log({ message: error.message });
    return { status: 500, data: { message: error.message } };
  }

  if (!completion) {
    return { data: { message: 'No completion returned' } };
  }

  return completion.data;
};

export const recursiveSummarizeChunks = async ({
  documentChunks,
}: IRecursiveSummarizeChunks): Promise<string> => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.15,
    topP: 0.15,
  });

  const summarizedDocument = await documentChunks.reduce(
    async (accumulatorPromise: Promise<string>, chunk) => {
      const accumulator = await accumulatorPromise;

      const summarizePrompt = await getRecursiveSummarizeChunksPrompt({
        existingSummary: accumulator,
        newBlock: chunk.pageContent,
      });

      const currentSummarization = await chat.call([
        new HumanChatMessage(summarizePrompt),
      ]);

      return currentSummarization.text;
    },
    Promise.resolve(''),
  );

  // TODO: Add a final summarization step here. Doesn't seem to be necessary.

  return summarizedDocument;
};

/* 
  Implemented using a single chat instance as opposed to instantiating one for each call.
  Significantly faster.
*/
export const recursiveSummarizeBuffer = async ({
  buffer,
  fileName,
}: IRecursiveSummarizeBuffer): Promise<string> => {
  const documentChunks = await splitBufferByToken({
    buffer,
    fileName,
  });

  const chat = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.15,
    topP: 0.15,
  });

  const summarizedDocument = await documentChunks.reduce(
    async (accumulatorPromise: Promise<string>, chunk) => {
      const accumulator = await accumulatorPromise;

      const summarizePrompt = await getRecursiveSummarizeChunksPrompt({
        existingSummary: accumulator,
        newBlock: chunk.pageContent,
      });

      const currentSummarization = await chat.call([
        new HumanChatMessage(summarizePrompt),
      ]);

      return currentSummarization.text;
    },
    Promise.resolve(''),
  );

  // TODO: Add a final summarization step here.
  // NOTE: Doesn't seem to be necessary.

  return summarizedDocument;
};
