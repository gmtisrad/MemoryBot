import path from 'path';
import {
  TextSplitterChunkHeaderOptions,
  TokenTextSplitter,
} from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { handleDOCX, handlePDF, handlePlaintext } from '../files/helpers';

interface CreateDocumentInput {
  content: string;
  metadata?: Record<string, unknown>;
}

interface CreateDocumentsInput {
  documentsData: {
    content: string;
    metadata?: Record<string, unknown>;
  }[];
}

interface DocumentTokenSplitterInput {
  documents: Document[];
  chunkSize: number;
  chunkOverlap?: number;
  chunkHeaderOptions?: TextSplitterChunkHeaderOptions;
}

interface SplitRawTextByTokenInput {
  text: string;
  metadata?: Record<string, unknown>;
  chunkHeaderOptions?: TextSplitterChunkHeaderOptions;
}

interface splitBufferByToken {
  buffer: Buffer;
  metadata?: Record<string, unknown>;
  fileName?: string;
  chunkHeaderOptions?: TextSplitterChunkHeaderOptions;
}

export const createDocument = ({
  content,
  metadata,
}: CreateDocumentInput): Document => {
  const document = new Document({ pageContent: content, metadata });
  return document;
};

export const createDocuments = ({
  documentsData,
}: CreateDocumentsInput): Document[] => {
  return documentsData.map(({ content, metadata }) =>
    createDocument({ content, metadata }),
  );
};

export const documentsTokenSplitter = async ({
  documents,
  chunkSize,
  chunkOverlap,
  chunkHeaderOptions,
}: DocumentTokenSplitterInput): Promise<Document[]> => {
  const splitter = new TokenTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.splitDocuments(documents, chunkHeaderOptions);

  return chunks;
};

export const splitTextByToken = async ({
  text,
  metadata,
  chunkHeaderOptions,
}: SplitRawTextByTokenInput) => {
  const document = createDocument({
    content: text,
    metadata,
  });

  const splitDocuments: Document[] = await documentsTokenSplitter({
    documents: [document],
    chunkSize: 512,
    chunkOverlap: 64,
    chunkHeaderOptions,
  });

  return splitDocuments;
};

/**
 * Takes a buffer, determines file-type, extracts text and splits it into chunks based on the token.
 */
export const splitBufferByToken = async ({
  buffer,
  metadata,
  fileName,
  chunkHeaderOptions,
}: splitBufferByToken): Promise<Document[]> => {
  // Determine the file type based on its extension
  const extension = fileName ? path.extname(fileName).toLowerCase() : null;

  let text;

  // Call the appropriate function based on the file type
  if (extension === '.pdf') {
    text = await handlePDF(buffer);
  } else if (extension === '.docx') {
    text = await handleDOCX(buffer);
  } else {
    text = await handlePlaintext(buffer);
  }

  const splitDocuments: Document[] = await splitTextByToken({
    text,
    metadata,
    chunkHeaderOptions,
  });

  return splitDocuments;
};
