import { PromptTemplate } from 'langchain';

export const getSummarizePrompt = async ({
  text,
}: {
  text: string;
}): Promise<string> => {
  const summarizeTemplate =
    "Given the following text, provide a concise and comprehensive summary that encapsulates all key points and details. Omit no crucial information or details such as dates, names, events, actions or locations. Only provide the summary text. Here's the text to summarize: {text}";

  const summarizePromptTemplate = new PromptTemplate({
    template: summarizeTemplate,
    inputVariables: ['text'],
  });

  return (await summarizePromptTemplate.format({ text })) || '';
};

export const getRecursiveSummarizePrompt = async ({
  existingSummary,
  newBlock,
}: {
  existingSummary: string;
  newBlock: string;
}): Promise<string> => {
  const summarizeTemplate =
    "You will be given a partial summary and a new block of information. Your task is to provide a concise and comprehensive summary that encapsulates all key points and details of the existing summary, as well as the new block of information. Omit no crucial information or details. Only provide the summary text. \nHere's the existing summary: {existingSummary}\nHere's the text to summarize: {newBlock}";

  const summarizePromptTemplate = new PromptTemplate({
    template: summarizeTemplate,
    inputVariables: ['existingSummary', 'newBlock'],
  });

  return (
    (await summarizePromptTemplate.format({ existingSummary, newBlock })) || ''
  );
};
