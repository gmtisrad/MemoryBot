import express from 'express';
import { getDb } from './mongoInit';
import { DataType } from '@zilliz/milvus2-sdk-node';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

export const dbRouter = express.Router();

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
