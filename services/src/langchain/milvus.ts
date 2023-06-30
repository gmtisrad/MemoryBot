import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Milvus, MilvusLibArgs } from 'langchain/vectorstores/milvus';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';
import {
  ConversationalRetrievalQAChain,
  RetrievalQAChain,
} from 'langchain/chains';
import { OpenAI } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChainValues } from 'langchain/schema';

interface EmbedAndStore {
  collection: string;
  documents: Document[];
}

interface similaritySearch {
  collection: string;
  query: string;
  temperature?: number;
  topP?: number;
}

interface HybridChatSimilaritySearch {
  caseId: string;
  query: string;
  chatHistory?: string[];
  temperature?: number;
  topP?: number;
}

// collection should be case name
// database value is legalai?
export const embedAndStore = async ({
  collection,
  documents,
}: EmbedAndStore) => {
  const dbConfig: MilvusLibArgs = {
    url: `${process.env.MILVUS_URL}:${process.env.MILVUS_PORT}`,
    collectionName: collection,
  };

  const embeddings = new OpenAIEmbeddings({
    modelName: process.env.OPENAI_EMBEDDING_MODEL,
  });

  await Milvus.fromDocuments(documents, embeddings, dbConfig);
};

// export const textSimilaritySearch = async ({
//   collection,
//   query,
// }: similaritySearch) => {
//   const dbConfig: MilvusLibArgs = {
//     url: `${process.env.MILVUS_URL}:${process.env.MILVUS_PORT}`,
//     collectionName: collection,
//   };

//   const embeddings = new OpenAIEmbeddings({
//     modelName: process.env.OPENAI_EMBEDDING_MODEL,
//   });

//   const vectorStore = await Milvus.fromExistingCollection(embeddings, dbConfig);

//   const retriever = new ContextualCompressionRetriever({
//     baseCompressor,
//     baseRetriever: vectorStore.asRetriever(),
//   });

//   const similarityResults = vectorStore.similaritySearch(query);
// };

export const textSimilaritySearch = async ({
  collection,
  temperature,
  topP,
  query,
}: similaritySearch): Promise<ChainValues> => {
  console.log('Text Similarity Search');

  const model = new OpenAI({
    modelName: 'gpt-3.5-turbo',
    ...(temperature && { temperature }),
    ...(topP && { topP }),
  });

  console.log('Model created');

  const chat = new ChatOpenAI({
    modelName: 'gpt-4',
    ...(temperature && { temperature }),
    ...(topP && { topP }),
  });

  console.log('Chat created');

  const baseCompressor = LLMChainExtractor.fromLLM(model);

  console.log('Base compressor created');

  const dbConfig: MilvusLibArgs = {
    url: `${process.env.MILVUS_URL}:${process.env.MILVUS_PORT}`,
    collectionName: collection,
  };

  const embeddings = new OpenAIEmbeddings({
    modelName: process.env.OPENAI_EMBEDDING_MODEL,
  });

  console.log('Embeddings created');

  const vectorStore = await Milvus.fromExistingCollection(embeddings, dbConfig);

  console.log('Vector store created');

  const retriever = new ContextualCompressionRetriever({
    baseCompressor,
    baseRetriever: vectorStore.asRetriever(25),
  });

  console.log('Retriever created');

  const chain = RetrievalQAChain.fromLLM(chat, retriever);

  console.log('Chain created');

  const res = await chain.call({
    query,
  });

  console.log('Chain called');

  return res;
};

export const hybridChatSimilaritySearch = async ({
  caseId,
  chatHistory,
  temperature,
  topP,
  query,
}: HybridChatSimilaritySearch): Promise<ChainValues> => {
  const compressionModel = new OpenAI({
    modelName: 'gpt-3.5-turbo',
    ...(temperature && { temperature }),
    ...(topP && { topP }),
  });

  const chatModel = new ChatOpenAI({
    modelName: 'gpt-4',
    ...(temperature && { temperature }),
    ...(topP && { topP }),
  });

  const baseCompressor = LLMChainExtractor.fromLLM(compressionModel);

  const dbConfig: MilvusLibArgs = {
    url: `${process.env.MILVUS_URL}:${process.env.MILVUS_PORT}`,
    collectionName: `case_${caseId}`,
  };

  const embeddings = new OpenAIEmbeddings({
    modelName: process.env.OPENAI_EMBEDDING_MODEL,
  });

  const vectorStore = await Milvus.fromExistingCollection(embeddings, dbConfig);

  const retriever = new ContextualCompressionRetriever({
    baseCompressor,
    baseRetriever: vectorStore.asRetriever(25),
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(chatModel, retriever);

  const res = await chain.call({
    question: query,
    chat_history: chatHistory || [],
  });

  return res;
};
