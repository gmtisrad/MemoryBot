import { useState } from 'react';

interface IUseSendQuestionArgs {
  question: string;
  previousMessages: string[];
}

interface IUseSendQuestionResponse {
  data: any;
  error: any;
  isLoading: boolean;
  sendPrompt: () => void;
}

export const useSendQuestion: (
  args: IUseSendQuestionArgs,
) => IUseSendQuestionResponse = ({ question, previousMessages }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
};
