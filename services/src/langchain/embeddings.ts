import { Document } from 'langchain/dist/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export class Embeddings {
  private static openAIEmbeddings: OpenAIEmbeddings | undefined;

  static getOpenAIEmbeddings(): OpenAIEmbeddings {
    if (!this.openAIEmbeddings) {
      this.openAIEmbeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.openAIApiKey,
      });
    }
    return this.openAIEmbeddings;
  }

  /**
   *
   * @param documents Array of langchain document data objects
   * @returns An array of embeddings/vectors for each document
   */
  static async embedDocuments({
    documents,
  }: {
    documents: Document<Record<string, any>>[];
  }): Promise<number[][]> {
    let embeddings;
    try {
      embeddings = await this.getOpenAIEmbeddings().embedDocuments(
        documents.map((document) => document.pageContent),
      );
    } catch (error: any) {
      console.log({ message: error.message });
      throw new Error(`Error embedding documents: ${error.message}`);
    }

    return embeddings;
  }

  /**
   *
   * @param query string to embed for querying milvus
   * @returns An embedding/vector for the query
   */
  static async embedQuery({ query }: { query: string }): Promise<number[]> {
    let embedding;
    try {
      embedding = await this.getOpenAIEmbeddings().embedQuery(query);
    } catch (error: any) {
      console.log({ message: error.message });
      throw new Error(`Error embedding query: ${error.message}`);
    }

    return embedding;
  }
}
