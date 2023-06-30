import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './mongoInit';
import {
  IGetCaseDocumentsArgs,
  IGetDocumentEntryArgs,
  IInsertDocumentEntryArgs,
  IInsertVectorDocumentEntryArgs,
} from './types';

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

export const getCase = async ({ caseId }: { caseId: string }): Promise<any> => {
  const mongoDB = await getDb();

  const mongoRes = await mongoDB.collection('cases').findOne({
    _id: new ObjectId(caseId),
  });

  return mongoRes;
};
