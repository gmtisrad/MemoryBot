import { TogetherAI } from '@langchain/community/llms/togetherai';
import { creationWithSystemPrompt } from './templates';

let _mixtralClient: TogetherAI | undefined;

export const getMixtralClient = () => {
  if (!_mixtralClient) {
    _mixtralClient = new TogetherAI({
      modelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      apiKey: process.env.TOGETHER_API_KEY,
    });
  }

  return _mixtralClient;
};

export const createCompletion: (prompt: string) => any = async (
  prompt: string,
) => {
  const mixtralClient = await getMixtralClient();

  let completion;

  try {
    const chain = creationWithSystemPrompt.pipe(mixtralClient)
  }
};
