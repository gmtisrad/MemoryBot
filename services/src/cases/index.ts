import express from 'express';
import { getDb } from '../db/mongoInit';
import {
  createCase,
  createCaseFolder,
  getCase,
  getUserCases,
  structureFolders,
} from './helpers';

export const casesRouter = express.Router();

casesRouter.post('/create', async (req, res) => {
  const { caseName, userId } = req.body;

  let createCaseRes;

  try {
    createCaseRes = await createCase({ caseName, userId });
  } catch (e) {
    console.log(e);
  }

  res.json({ caseName, createCaseRes, status: 'success' });
});

casesRouter.post('/folders/create', async (req, res) => {
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

casesRouter.get('/user/:userId', async (req, res) => {
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

        const documentsRes = await mongoDB
          .collection('documents')
          .find({ _id: { $in: caseItem.documents } })
          .toArray();

        const chatsRes = await mongoDB
          .collection('chats')
          .find({ caseId: caseItem._id })
          .toArray();

        const generatedDocuments = await mongoDB
          .collection('generatedDocuments')
          .find({ caseId: caseItem._id })
          .toArray();

        const structuredFolders = structureFolders({
          folders: foldersRes,
          documents: documentsRes,
        });

        return {
          ...caseItem,
          folders: structuredFolders,
          documents: documentsRes.filter((doc: any) => !doc.folderId) || [],
          chats: chatsRes || [],
          generatedDocuments,
        };
      }),
    );
  } catch (e) {
    console.log(e);
    res.status(500).send('Error getting cases');
    return;
  }

  res.json({ cases: casesWithFolders });
});

casesRouter.get('/:caseId', async (req, res) => {
  const { caseId } = req.params;

  let _case;

  try {
    _case = await getCase({ caseId });
  } catch (e) {
    console.log(e);
    res.status(500).send('Error getting case');
  }

  res.json({ _case });
});
