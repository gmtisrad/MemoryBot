import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongoInit';
import {
  ICreateCaseArgs,
  ICreateCaseFolderArgs,
  IGetCaseArgs,
  IGetUserCasesArgs,
  IStructureFoldersArgs,
} from './types';

export const createCase: (args: ICreateCaseArgs) => any = async ({
  caseName,
  userId,
}) => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('cases')
    .insertOne({
      name: caseName,
      userId: new ObjectId(userId),
      folders: [],
      documents: [],
      chats: [],
      generatedDocuments: [],
    });

  return { acknowledged, insertedId };
};

export const createCaseFolder: (args: ICreateCaseFolderArgs) => any = async ({
  caseId,
  folderName,
  parent,
}) => {
  const mongoDB = await getDb();

  const { acknowledged: folderInsertAcknowledged, insertedId } = await mongoDB
    .collection('folders')
    .insertOne({
      name: folderName,
      parent,
      caseId: new ObjectId(caseId),
    });

  const caseQuery = { _id: new ObjectId(caseId) };

  const { acknowledged: caseUpdateAcknowledged, upsertedId } = await mongoDB
    .collection('cases')
    .updateOne(caseQuery, {
      $push: {
        folders: insertedId,
      },
    });

  return {
    folderInsertAcknowledged,
    caseUpdateAcknowledged,
    upsertedId,
    insertedId,
  };
};

export const getUserCases: (args: IGetUserCasesArgs) => any = async ({
  userId,
}) => {
  const mongoDB = await getDb();

  const mongoRes = await mongoDB
    .collection('cases')
    .find({
      userId: new ObjectId(userId),
    })
    .toArray();

  return mongoRes;
};

export const structureFolders: (args: IStructureFoldersArgs) => any = ({
  folders,
  documents,
}) => {
  // Create a lookup for folders by their id
  const foldersById: Record<string, any> = {};
  folders.forEach((folder) => {
    foldersById[folder._id.toString()] = { ...folder, folders: [] };
  });

  // Create a lookup for documents by their folderIds
  const documentsByFolderId: Record<string, any> = {};
  documents.forEach((document) => {
    if (document.folderId !== null) {
      documentsByFolderId[document.folderId.toString()] = [
        ...(documentsByFolderId[document.folderId.toString()] || []),
        document,
      ];
    }
  });

  // Iterate over the folders and build the hierarchy
  folders.forEach((folder) => {
    foldersById[folder._id.toString()].documents =
      documentsByFolderId[folder._id.toString()] || [];
    if (folder.parent !== null) {
      // Add documents to the subFolder
      // If the folder has a parent, add it to the parent's "folders" array
      foldersById[folder.parent].folders.push(
        foldersById[folder._id.toString()],
      );
    }
  });

  // Extract the root folders (folders with no parent) to add to the case
  const rootFolders = Object.values(foldersById).filter(
    (folder) => folder.parent === null,
  );

  return rootFolders;
};

export const getCase: (args: IGetCaseArgs) => any = async ({ caseId }) => {
  const mongoDB = await getDb();

  const caseRes = await mongoDB.collection('cases').findOne({
    _id: new ObjectId(caseId),
  });

  if (!caseRes) {
    throw new Error('Case not found');
  }

  const foldersRes = await mongoDB
    .collection('folders')
    .find({ caseId: caseId })
    .toArray();

  const caseDocuments = await mongoDB
    .collection('documents')
    .find({ _id: { $in: caseRes?.documents } })
    .toArray();

  const rootFolders = structureFolders({
    folders: foldersRes,
    documents: caseDocuments,
  });

  return {
    _id: caseRes._id,
    name: caseRes.caseName,
    folders: rootFolders,
    documents: caseDocuments.filter((doc) => doc.folderId === null),
  };
};
