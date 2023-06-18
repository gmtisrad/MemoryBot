import { ObjectId } from 'mongodb';
import express from 'express';
import {
  createGeneratedDocument,
  promptOpenAI,
  promptOpenAIGenerateDocument,
} from './helpers';
import { getDb } from '../db/mongoInit';

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

partnerRouter.post('/prompt', async (req, res) => {
  const { prompt, numResults, previousMessages, userId, caseId, chatId } =
    req.body;

  const { response } = await promptOpenAI({
    prompt,
    numResults,
    previousMessages,
    userId,
    caseId,
    chatId,
  });

  res.json({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    response,
  });
});
