import { PromptTemplate } from 'langchain';

export const creationWithSystemPrompt = PromptTemplate.fromTemplate(
  'System: {system} User: {prompt} Response: ',
);
