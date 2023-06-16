import express from 'express';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';

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

export const completionRouter = express.Router();

export const createCompletion: (prompt: string) => any = async (
  prompt: string,
) => {
  const openAiClient = await getOpenAiClient();

  let completion;

  // try {
  //   completion = await openAiClient?.createChatCompletion({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       { role: ChatCompletionRequestMessageRoleEnum.User, content: prompt },
  //     ],
  //   });
  // } catch (error: any) {
  //   console.log({ message: error.message });
  // }

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
