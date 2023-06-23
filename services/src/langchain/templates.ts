import { PromptTemplate } from 'langchain';

export const getSummarizePrompt = async ({
  text,
}: {
  text: string;
}): Promise<string> => {
  const summarizeTemplate =
    "Given the following text, provide a concise and comprehensive summary that encapsulates all key points and details within a maximum of 50 words. Omit no crucial information. Here's the text: {text}";

  const summarizePromptTemplate = new PromptTemplate({
    template: summarizeTemplate,
    inputVariables: ['text'],
  });

  return (await summarizePromptTemplate.format({ text })) || '';
};
