import express from 'express';
import { getDb } from './mongoInit';
import { DataType } from '@zilliz/milvus2-sdk-node';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

export const dbRouter = express.Router();

interface IInsertDocumentEntryArgs {
  name: string;
  uploadedBy: string;
  documentDate: string;
  description: string;
  s3Url: string;
  folderId: string;
  title: string;
  caseId: string;
}

export const insertDocumentEntry: (
  args: IInsertDocumentEntryArgs,
) => any = async ({
  name,
  documentDate,
  uploadedBy,
  description,
  s3Url,
  folderId,
  caseId,
  title,
}) => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('documents')
    .insertOne({
      uploadedDate: Date.now(),
      name,
      documentDate,
      uploadedBy,
      description,
      s3Url,
      folderId: folderId ? new ObjectId(folderId) : null,
      caseId: new ObjectId(caseId),
      title,
    });

  await mongoDB
    .collection('cases')
    .updateOne(
      { _id: new ObjectId(caseId) },
      { $push: { documents: insertedId } },
    );

  return { acknowledged, insertedId };
};

interface IGetDocumentEntryArgs {
  name: string;
  folderId: string;
  caseId: string;
  userId: string;
}

export const getDocumentEntry: (args: IGetDocumentEntryArgs) => any = async ({
  name,
  folderId,
  caseId,
  userId,
}) => {
  const mongoDB = await getDb();

  const mongoRes = await mongoDB.collection('documents').findOne({
    name,
    folderId,
    caseId,
    uploadedBy: userId,
  });

  return mongoRes;
};

interface IGetCaseDocumentsArgs {
  caseId: string;
  userId: string;
}

export const getCaseDocuments: (args: IGetCaseDocumentsArgs) => any = async ({
  caseId,
  userId,
}) => {
  const mongoDB = await getDb();

  const mongoRes = await mongoDB
    .collection('documents')
    .find({
      caseId,
      uploadedBy: userId,
    })
    .toArray();

  return mongoRes;
};

interface IInsertVectorDocumentEntryArgs {
  documentChunkEmbedding: DataType.FloatVector;
  documentChunkOriginal: string;
  vectorDBId: DataType.Int64;
}

export const insertVectorDocumentEntry: (
  args: IInsertVectorDocumentEntryArgs,
) => any = async ({
  documentChunkEmbedding,
  documentChunkOriginal,
  vectorDBId,
}) => {
  const mongoDB = await getDb();

  const newId = new ObjectId(uuidv4());

  const { acknowledged, insertedId } = await mongoDB
    .collection('documents')
    .insertOne({
      _id: newId,
      documentChunkEmbedding,
      documentChunkOriginal,
      vectorDBId,
    });

  return { acknowledged, insertedId };
};

dbRouter.post('/insertVector', async (req, res) => {
  const { documentChunkEmbedding, documentChunkOriginal, vectorDBId } =
    req.body;

  const { acknowledged, insertedId } = await insertVectorDocumentEntry({
    documentChunkEmbedding,
    documentChunkOriginal,
    vectorDBId,
  });

  res.json({
    acknowledged,
    insertedId,
  });
});

interface ICreateCaseArgs {
  caseName: string;
  userId: string;
}

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
    });

  return { acknowledged, insertedId };
};

interface ICreateCaseFolderArgs {
  caseId: string;
  folderName: string;
  parent: string | null;
}

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

interface IGetUserCasesArgs {
  userId: string;
}

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

interface IStructureFoldersArgs {
  folders: any[];
  documents: any[];
}

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

interface IGetCaseArgs {
  caseId: string;
}

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

  console.log({ caseDocuments });

  return {
    _id: caseRes._id,
    name: caseRes.caseName,
    folders: rootFolders,
    documents: caseDocuments.filter((doc) => doc.folderId === null),
  };
};

interface ICreateUserArgs {
  email: string;
}

export const createUser: (args: ICreateUserArgs) => any = async ({ email }) => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('users')
    .insertOne({
      email,
    });

  return { acknowledged, insertedId };
};
