import express from 'express';
import { getMilvusClient } from './milvusInit';
import { DataType, MutationResult } from '@zilliz/milvus2-sdk-node';

export const vectorDBRouter = express.Router();

interface IInsertDocumentEntryArgs {
  documentChunkEmbedding: DataType.FloatVector;
  documentChunkOriginal: DataType.VarChar;
}

interface IInsertDocumentsEntryArgs {
  entries: {
    documentChunkEmbedding: number[];
    documentChunkOriginal: string;
  }[];
}

export const insertDocumentEntry: (
  args: IInsertDocumentEntryArgs,
) => Promise<MutationResult | undefined> = async ({
  documentChunkEmbedding,
  documentChunkOriginal,
}) => {
  const client = getMilvusClient();

  let insertResponse;

  try {
    insertResponse = await client.insert({
      collection_name: 'documents',
      fields_data: [
        {
          document_chunk_embedding: documentChunkEmbedding,
          document_chunk_original: documentChunkOriginal,
        },
      ],
    });
  } catch (error: any) {
    console.log({ message: error.message });
  }

  return insertResponse;
};

export const insertDocumentsEntry: (
  args: IInsertDocumentsEntryArgs,
) => Promise<MutationResult | undefined> = async ({ entries }) => {
  const client = getMilvusClient();

  let insertResponse;

  try {
    insertResponse = await client.insert({
      collection_name: 'documents',
      fields_data: entries.map(
        ({ documentChunkEmbedding, documentChunkOriginal }) => ({
          document_chunk_embedding: documentChunkEmbedding,
          document_chunk_original: documentChunkOriginal,
        }),
      ),
    });
  } catch (error: any) {
    console.log({ message: error.message });
  }

  return insertResponse;
};

export const loadMilvusCollection = async (collectionName: string) => {
  const client = getMilvusClient();

  return await client.loadCollectionSync({
    collection_name: collectionName,
  });
};

interface ISimilaritySearchArgs {
  promptEmbedding: number[];
  numResults: string;
}

export const similaritySearch: (args: ISimilaritySearchArgs) => any = async ({
  promptEmbedding,
  numResults,
}) => {
  const client = getMilvusClient();

  let searchResponse;

  try {
    await loadMilvusCollection('documents');

    const searchParams = {
      anns_field: 'document_chunk_embedding',
      topk: numResults,
      // Euclidean distance, L2, a lower score is better. Less diff between two vectors.
      metric_type: 'L2',
      params: JSON.stringify({ nprobe: 1024 }),
    };

    searchResponse = await client.search({
      collection_name: 'documents',
      expr: '',
      vectors: [promptEmbedding],
      search_params: searchParams,
      vector_type: 101, // DataType.FloatVector
    });

    // Release the collection after the search has completed.
    await client.releaseCollection({ collection_name: 'documents' });
  } catch (error: any) {
    console.log({ message: error.message });
  }

  return searchResponse?.results;
};

vectorDBRouter.post('/create', async (req, res) => {
  const { documentChunkEmbedding, documentChunkOriginal } = req.body;

  const response = await insertDocumentEntry({
    documentChunkEmbedding,
    documentChunkOriginal,
  });

  res.json({
    status: response?.status,
    ids: response?.IDs,
    acknowledged: response?.acknowledged,
  });
});
