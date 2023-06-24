import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { Document } from 'langchain/document';
import {
  getRecursiveSummarizePrompt,
  getSummarizePrompt,
} from '../langchain/templates';
import { promptGPT35Turbo } from '../langchain/chatGPT';

let _openAiClient: OpenAIApi | undefined;

interface IRecursiveSummarize {
  documentChunks: Document[];
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

export const recursiveSummarize = async ({
  documentChunks,
}: IRecursiveSummarize): Promise<string> => {
  const summarizedDocument = await documentChunks.reduce(
    async (accumulatorPromise: Promise<string>, chunk) => {
      const accumulator = await accumulatorPromise;

      // const summarizePrompt = await getSummarizePrompt({
      //   text: `${accumulator}\n${chunk.pageContent}`,
      // });

      const summarizePrompt = await getRecursiveSummarizePrompt({
        existingSummary: accumulator,
        newBlock: chunk.pageContent,
      });

      console.log({ summarizePrompt });

      const currentSummarization = await promptGPT35Turbo({
        prompt: summarizePrompt,
        temperature: 0.3,
      });

      console.log({ currentSummarization });

      return currentSummarization;
    },
    Promise.resolve(''),
  );

  console.log({ summarizedDocument });

  return summarizedDocument;
};
