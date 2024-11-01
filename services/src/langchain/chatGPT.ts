import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';

export const promptGPT4 = async ({
  prompt,
  temperature,
  topP,
}: {
  prompt: string;
  temperature?: number;
  topP?: number;
}) => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: temperature || 0.6,
    ...(topP && { topP }),
  });

  const message = await chat.call([new HumanChatMessage(prompt)]);

  return message.text;
};

export const promptGPT35Turbo = async ({
  prompt,
  temperature,
  topP,
}: {
  prompt: string;
  temperature?: number;
  topP?: number;
}): Promise<string> => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: temperature || 0.6,
    ...(topP && { topP }),
  });

  const message = await chat.call([new HumanChatMessage(prompt)]);

  return message.text;
};
