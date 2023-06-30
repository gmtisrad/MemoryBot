import { ObjectId } from 'mongodb';
import express from 'express';
import {
  createGeneratedDocument,
  promptOpenAIGenerateDocument,
} from './helpers';
import { getDb } from '../db/mongoInit';
import {
  hybridChatSimilaritySearch,
  textSimilaritySearch,
} from '../langchain/milvus';
import { createChat, getChat, insertMessages } from '../chats/helpers';
import { promptGPT35Turbo } from '../langchain/chatGPT';
import { getChatNamePrompt } from '../langchain/templates';
import { ChatMessage } from 'langchain/schema';
import { IMessage } from '../chats/types';

export const partnerRouter = express.Router();

partnerRouter.post('/generateDocument', async (req, res) => {
  const {
    caseId,
    userId,
    caseDetails,
    numResults,
    previousMessages,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
    sections,
  } = req.body;

  const { response } = await promptOpenAIGenerateDocument({
    caseDetails,
    numResults,
    previousMessages,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
    sections,
  });

  await createGeneratedDocument({
    userId: new ObjectId(userId),
    caseId: new ObjectId(caseId),
    generatedContent: response,
    caseDetails,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
    sections,
  });

  res.json({ response });
});

partnerRouter.get(
  '/:caseId/generated/:generatedDocumentId',
  async (req, res) => {
    const { caseId, generatedDocumentId } = req.params;

    const mongoDB = await getDb();

    const generatedDocument = await mongoDB
      .collection('generatedDocuments')
      .findOne({
        _id: new ObjectId(generatedDocumentId),
        caseId: new ObjectId(caseId),
      });

    res.json({ generatedDocument });
  },
);

partnerRouter.get('/:caseId/generated', async (req, res) => {
  const { caseId } = req.params;

  const mongoDB = await getDb();

  const generatedDocuments = await mongoDB
    .collection('generatedDocuments')
    .find({
      caseId: new ObjectId(caseId),
    })
    .toArray();

  res.json({ generatedDocuments });
});

// partnerRouter.post('/prompt', async (req, res) => {
//   const { prompt, numResults, previousMessages, userId, caseId, chatId } =
//     req.body;

//   const { response } = await promptOpenAI({
//     prompt,
//     numResults,
//     previousMessages,
//     userId,
//     caseId,
//     chatId,
//   });

//   res.json({
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     response,
//   });
// });

partnerRouter.post('/prompt', async (req, res) => {
  const { prompt, previousMessages, userId, caseId, chatId } = req.body;

  const chainValues = await textSimilaritySearch({
    collection: `case_${caseId}`,
    query: prompt,
  });

  res.json({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    response: chainValues?.text,
  });
});

partnerRouter.post('/chat/prompt', async (req, res) => {
  const { prompt, userId, caseId, chatId } = req.body;

  let relevantChatId = chatId;

  if (!chatId) {
    const chatNamePrompt = await getChatNamePrompt({
      firstMessage: prompt,
    });

    const chatName = await promptGPT35Turbo({
      prompt: chatNamePrompt,
    });

    const { chatId } = await createChat({
      userId: new ObjectId(userId),
      caseId: new ObjectId(caseId),
      name: chatName,
    });

    relevantChatId = chatId;
  }

  await insertMessages({
    chatId: new ObjectId(relevantChatId),
    messages: [
      {
        _id: new ObjectId(),
        isUser: true,
        content: prompt,
      },
    ],
  });

  const { chat } = await getChat({
    chatId: relevantChatId,
  });

  const chatHistory = chat?.messages?.map(
    (message: IMessage) => new ChatMessage(message?.content, 'chat'),
  );

  const chainValues = await hybridChatSimilaritySearch({
    caseId,
    query: prompt,
    chatHistory,
  });

  await insertMessages({
    chatId: new ObjectId(relevantChatId),
    messages: [
      {
        _id: new ObjectId(),
        isUser: false,
        content: chainValues?.text,
      },
    ],
  });

  res.json({
    response: chainValues?.text,
  });
});
