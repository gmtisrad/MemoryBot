import express from 'express';
import { getDb } from './mongoInit';
import { DataType } from '@zilliz/milvus2-sdk-node';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

export const dbRouter = express.Router();

interface IInsertDocumentEntryArgs {
  documentName: string;
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
  documentName,
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
      documentName,
      documentDate,
      uploadedBy,
      description,
      s3Url,
      folderId,
      caseId,
      title,
    });

  return { acknowledged, insertedId };
};

interface IGetDocumentEntryArgs {
  documentName: string;
  folderName: string;
  caseName: string;
  userId: string;
}

export const getDocumentEntry: (args: IGetDocumentEntryArgs) => any = async ({
  documentName,
  folderName,
  caseName,
  userId,
}) => {
  const mongoDB = await getDb();

  const mongoRes = await mongoDB.collection('documents').findOne({
    documentName,
    folderName,
    caseName,
    uploadedBy: userId,
  });

  return mongoRes;
};

interface IGetCaseDocumentsArgs {
  caseName: string;
  userId: string;
}

export const getCaseDocuments: (args: IGetCaseDocumentsArgs) => any = async ({
  caseName,
  userId,
}) => {
  const mongoDB = await getDb();

  const mongoRes = await mongoDB
    .collection('documents')
    .find({
      caseName,
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
    .insertOne({ name: folderName, parent, caseId: new ObjectId(caseId) });

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
}

export const structureFolders: (args: IStructureFoldersArgs) => any = ({
  folders,
}) => {
  // Create a lookup for folders by their id
  const foldersById: Record<string, any> = {};
  folders.forEach((folder) => {
    foldersById[folder._id.toString()] = { ...folder, folders: [] };
  });

  // Iterate over the folders and build the hierarchy
  folders.forEach((folder) => {
    if (folder.parent !== null) {
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

  console.log({ folders, rootFolders });

  return rootFolders;
};

interface IGetCaseArgs {
  caseId: string;
}

export const getCase: (args: IGetCaseArgs) => any = async ({ caseId }) => {
  const mongoDB = await getDb();

  const casesRes = await mongoDB
    .collection('cases')
    .find({
      _id: new ObjectId(caseId),
    })
    .toArray();

  const foldersRes = await mongoDB
    .collection('folders')
    .find({ caseId: caseId })
    .toArray();

  const rootFolders = structureFolders({ folders: foldersRes });

  return {
    _id: casesRes[0]._id,
    name: casesRes[0].caseName,
    folders: rootFolders,
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
