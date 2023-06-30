export interface IInsertDocumentEntryArgs {
  name: string;
  uploadedBy: string;
  documentDate: string;
  description: string;
  s3Url: string;
  folderId: string;
  title: string;
  caseId: string;
  key: string;
}

export interface IGetDocumentEntryArgs {
  documentId: string;
}

export interface IGetCaseDocumentsArgs {
  caseId: string;
  userId: string;
}

export interface IInsertVectorDocumentEntryArgs {
  documentChunkEmbedding: DataType.FloatVector;
  documentChunkOriginal: string;
  vectorDBId: DataType.Int64;
}
