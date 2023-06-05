import express from 'express';
import { getMilvusClient } from './melvusInit';
import { DataType, MutationResult } from '@zilliz/milvus2-sdk-node';

export const vectorDBRouter = express.Router();

interface ICreateEntryArgs {
  collectionName: string;
  documentChunkEmbedding: DataType.FloatVector;
  documentChunkOriginal: string;
}

export const createDocumentEntry: (
  args: ICreateEntryArgs,
) => Promise<MutationResult> = async ({
  collectionName,
  documentChunkEmbedding,
  documentChunkOriginal,
}) => {
  const client = getMilvusClient();

  const insertResponse = await client.insert({
    collection_name: collectionName,
    data: [
      {
        document_chunk_embedding: documentChunkEmbedding,
        document_chunk_original: documentChunkOriginal,
      },
    ],
  });

  return insertResponse;
};

vectorDBRouter.post('/create', async (req, res) => {
  const { collectionName, documentChunkEmbedding, documentChunkOriginal } =
    req.body;

  const response = await createDocumentEntry({
    collectionName,
    documentChunkEmbedding,
    documentChunkOriginal,
  });

  res.json({
    status: response?.status,
    ids: response?.IDs,
    acknowledged: response?.acknowledged,
  });
});
