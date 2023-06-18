import { DataType } from '@zilliz/milvus2-sdk-node';

export interface IInsertDocumentEntryArgs {
  documentChunkEmbedding: DataType.FloatVector;
  documentChunkOriginal: DataType.VarChar;
}

export interface IInsertDocumentsEntryArgs {
  entries: {
    documentChunkEmbedding: number[];
    documentChunkOriginal: string;
  }[];
}

export interface ISimilaritySearchArgs {
  promptEmbedding: number[];
  numResults: string;
}
