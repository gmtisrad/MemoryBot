import { ObjectId } from 'mongodb';
import { createCompletion } from '../openAI/helpers';
import { createEmbedding } from '../embedding/helpers';
import {
  ICreateGeneratedDocumentArgs,
  ICreateGeneratedDocumentRes,
  IPromptOpenAiArgs,
  IPromptOpenAiGenerateDocumentArgs,
} from './types';
import { getDb } from '../db/mongoInit';
import { createChat, insertMessages } from '../chats/helpers';
import { similaritySearch } from '../vector_db/helpers';
import { IMessage } from '../chats/types';

export const promptOpenAI = async ({
  prompt,
  numResults,
  previousMessages,
  userId,
  caseId,
  chatId,
}: IPromptOpenAiArgs): Promise<{ response: string }> => {
  let createdChatId = new ObjectId(chatId);

  if (!chatId) {
    const createChatRes = await createChat({
      userId: new ObjectId(userId),
      caseId: new ObjectId(caseId),
      name: 'Chat',
    });

    createdChatId = createChatRes.chatId;
  }
  let stringifiedPreviousMessages = '';

  previousMessages.forEach((message) => {
    stringifiedPreviousMessages += message.isUser
      ? `User: ${message.content} |`
      : `Bot: ${message.content} |`;
  });

  const promptWithPrevMessages = `${stringifiedPreviousMessages} | Prompt: ${prompt}}`;

  const promptEmbedding = await createEmbedding(promptWithPrevMessages);

  if (!promptEmbedding) {
    throw new Error('Embedding could not be created');
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults: numResults || '10',
  });

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );

  const promptWithContext = `${similarChunks.join(
    '\r\n',
  )}\r\n----\r\n${previousMessages
    .map(({ content }) => content)
    .join('\r\n')}\r\nPrompt: ${prompt}`;

  const completion = await createCompletion(promptWithContext);

  if (completion.status === 500) {
    throw new Error('Error creating completion');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const response = completion.choices[0].message.content;

  const newMessage: IMessage = {
    _id: new ObjectId(),
    isUser: true,
    content: prompt,
  };

  const responseMessage: IMessage = {
    _id: new ObjectId(),
    isUser: false,
    content: response,
  };

  insertMessages({
    chatId: new ObjectId(createdChatId),
    messages: [newMessage, responseMessage],
  });

  return {
    response: completion.choices[0].message.content,
  };
};

export const promptOpenAIGenerateDocument = async ({
  caseDetails,
  numResults,
  previousMessages,
  cityName,
  stateName,
  documentType,
  partyA,
  partyB,
  sections,
}: IPromptOpenAiGenerateDocumentArgs): Promise<{ response: string }> => {
  // const DOCUMENT_GENERATOR_SYSTEM_PROMPT = `{GPT-4: Generate a legal document in HTML and CSS. The document should be designed for legal filings in the city of ${cityName} and the state of ${stateName}. It should adhere to the standard paper width of 8.5" wide for easy conversion to PDF, meaning the html document should have a width of '8.5in', not a max-width, but a style value of 'width: 8.5'. The legal document required is a ${documentType}, involving the case between ${partyA} (plaintiff) and ${partyB} (defendant). ${
  //   sections
  //     ? `Please ensure the generated document includes sections for ${sections.join(
  //         ' and ',
  //       )}.`
  //     : ''
  // }. Ensure it's appropriately formatted according to legal standards. The document should be centered horizontally, no exceptions on this condition`;

  const DOCUMENT_GENERATOR_SYSTEM_PROMPT = `{System GPT4: You are an AI legal assistant, you should try to reference specific state and federal case law when you generate responses. You are operating in the state of Oregon.. You are able to request any information about the case that you may need in order to refine the user's request in order for you to generate a meaningful response. The documents available to you are: The titles of the documents available to you are: CamdenBuchananAffidavit.pdf DangerSmithAffidavit.pdf EdenSaabAffidavit.pdf JerseyJacksonAffidavit.pdf MarlowNavarroAffidavit.pdf TriniRedbirdAffidavit.pdf Exhibit1.pdf Exhibit2CrowdControlPolicy.pdf Exhibit3AudioRecording.pdf Exhibit4AreaMap.pdf JacksonVNavarroComplaint.pdf JacksonVNavarroAnswer.pdf JacksonVNavarroFinalJuryInstruction.pdf JacksonVNavarroStipulations.pdf}`;

  // const generateDocumentPrompt = `${DOCUMENT_GENERATOR_PROMPT_PREFIX}\r\n\nPrompt: ${prompt}`;

  const generateDocumentPrompt = `${DOCUMENT_GENERATOR_SYSTEM_PROMPT}\r\n\nCase Details: ${caseDetails}`;

  const promptEmbedding = await createEmbedding(
    `Case Details: ${caseDetails} City Name: ${cityName} State Name: ${stateName} Document Type: ${documentType} Party A: ${partyA} Party B: ${partyB}`,
  );

  if (!promptEmbedding) {
    throw new Error('Embedding could not be created');
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults: numResults || '10',
  });

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );

  const promptWithContext = `${similarChunks.join(
    '\r\n',
  )}\r\n----\r\n${previousMessages.join('\r\n')}\r\n${generateDocumentPrompt}`;

  const completion = await createCompletion(promptWithContext);

  if (completion.status === 500) {
    throw new Error('Error creating completion');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const response = completion.choices[0].message.content;

  return {
    response,
  };
};

export const createGeneratedDocument = async ({
  userId,
  caseId,
  generatedContent,
  caseDetails,
  cityName,
  stateName,
  documentType,
  partyA,
  partyB,
  sections,
}: ICreateGeneratedDocumentArgs): Promise<ICreateGeneratedDocumentRes> => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('generatedDocuments')
    .insertOne({
      userId,
      caseId,
      generatedContent,
      caseDetails,
      cityName,
      stateName,
      documentType,
      partyA,
      partyB,
      sections,
    });

  await mongoDB.collection('cases').updateOne(
    {
      _id: caseId,
    },
    {
      $push: {
        generatedDocuments: insertedId,
      },
    },
  );

  return { acknowledged, insertedId };
};
