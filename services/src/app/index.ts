import express from 'express';
import { createEmbedding } from '../embedding';
import { similaritySearch } from '../vector_db';
import { createCompletion } from '../completion';
import {
  createCase,
  createCaseFolder,
  getCase,
  getUserCases,
  structureFolders,
} from '../db';
import { getDb } from '../db/mongoInit';

export const appRouter = express.Router();

appRouter.post('/searchEmbedding', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  res.json({ embeddingSearchResponse });
});

appRouter.get('/getCaseDocuments', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  res.json({ embeddingSearchResponse });
});

appRouter.post('/promptRequest', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );

  const promptWithContext = `${similarChunks.join(
    '\r\n\n',
  )}\r\n\nPrompt: ${prompt}`;

  const completion = await createCompletion(promptWithContext);

  res.json({ completion });
});

appRouter.post('/cases/create', async (req, res) => {
  const { caseName, userId } = req.body;

  let createCaseRes;

  try {
    createCaseRes = await createCase({ caseName, userId });
  } catch (e) {
    console.log(e);
  }

  res.json({ caseName, createCaseRes, status: 'success' });
});

appRouter.post('/cases/folder/create', async (req, res) => {
  const { caseId, folderName, parent } = req.body;

  let createCaseFolderRes;

  try {
    createCaseFolderRes = await createCaseFolder({
      caseId,
      folderName,
      parent: parent || null,
    });
  } catch (e) {
    console.log(e);
  }

  res.json({ caseId, createCaseFolderRes, status: 'success' });
});

appRouter.get('/cases/user/:userId', async (req, res) => {
  const mongoDB = await getDb();

  const { userId } = req.params;

  let cases: any[];
  let casesWithFolders: any[];

  try {
    cases = await getUserCases({ userId });

    casesWithFolders = await Promise.all(
      cases.map(async (caseItem) => {
        const foldersRes = await mongoDB
          .collection('folders')
          .find({ _id: { $in: caseItem.folders } })
          .toArray();

        const structuredFolders = structureFolders({ folders: foldersRes });

        return { ...caseItem, folders: structuredFolders };
      }),
    );
  } catch (e) {
    console.log(e);
    res.status(500).send('Error getting cases');
    return;
  }

  res.json({ cases: casesWithFolders });
});

appRouter.get('/cases/:caseId', async (req, res) => {
  const { caseId } = req.params;

  let _case;

  try {
    _case = await getCase({ caseId });
  } catch (e) {
    console.log(e);
  }

  res.json({ _case });
});
