import { useState } from 'react';

interface IUseSendPromptArgs {
  prompt: string;
  previousMessages: string[];
  numResults?: number;
  caseId?: string;
  chatId?: string;
}

interface IUseSendPromptResponse {
  data: any;
  error: any;
  isLoading: boolean;
  sendPrompt: () => void;
}

export const useSendPrompt: (
  args: IUseSendPromptArgs,
) => IUseSendPromptResponse = ({
  prompt,
  previousMessages,
  numResults,
  caseId,
  chatId,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const sendPrompt = async () => {
    setIsLoading(true);
    let _response;
    try {
      _response = await fetch('/api/partner/chat/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          previousMessages,
          numResults,
          caseId,
          chatId,
        }),
      });
      const data = await _response.json();
      setData(data);
      return data.response;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, sendPrompt };
};
