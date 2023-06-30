import { PromptTemplate } from 'langchain';

export const getChatNamePrompt = async ({
  firstMessage,
}: {
  firstMessage: string;
}) => {
  const chatNameTemplate =
    "Using the first message of this chat as a reference, provide a name for this chat. Here's the first message: {firstMessage}";

  const chatNamePromptTemplate = new PromptTemplate({
    template: chatNameTemplate,
    inputVariables: ['firstMessage'],
  });

  return (await chatNamePromptTemplate.format({ firstMessage })) || '';
};

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

export const getRecursiveSummarizeChunksPrompt = async ({
  existingSummary,
  newBlock,
}: {
  existingSummary: string;
  newBlock: string;
}): Promise<string> => {
  const summarizeTemplate =
    'Reduce the token count of the following text without removing any information at all. Do so by simplifying language, reducing redundancies, using active voice, removing filler words, and condensing ideas (without losing information).\n\n{existingSummary}\n{newBlock}';

  const summarizePromptTemplate = new PromptTemplate({
    template: summarizeTemplate,
    inputVariables: ['existingSummary', 'newBlock'],
  });

  return (
    (await summarizePromptTemplate.format({ existingSummary, newBlock })) || ''
  );
};

// export const getRecursiveSummarizeChunksPrompt = async ({
//   existingSummary,
//   newBlock,
// }: {
//   existingSummary: string;
//   newBlock: string;
// }): Promise<string> => {
//   const summarizeTemplate =
//     "You will be given a partial summary and a new block of information. Your task is to provide a concise and comprehensive summary that encapsulates all key points and details of the existing summary, as well as the new block of information. Omit no crucial information or details. Only provide the summary text. \nHere's the existing summary: {existingSummary}\nHere's the text to summarize: {newBlock}";

//   const summarizePromptTemplate = new PromptTemplate({
//     template: summarizeTemplate,
//     inputVariables: ['existingSummary', 'newBlock'],
//   });

//   return (
//     (await summarizePromptTemplate.format({ existingSummary, newBlock })) || ''
//   );
// };
