import express from 'express';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import path from 'path';
import { TokenTextSplitter } from 'langchain/text_splitter';
import {
  getS3Config,
  getUpload,
  handleDOCX,
  handlePDF,
  handlePlaintext,
  streamToBuffer,
} from './helpers';
import { createEmbeddings } from '../embedding/helpers';
import { insertDocumentsEntry } from '../vector_db/helpers';
import {
  getCaseDocuments,
  getDocumentEntry,
  insertDocumentEntry,
} from '../db/helpers';

export const filesRouter = express.Router();

filesRouter.post(
  '/upload',
  getUpload().single('file'),
  async (req, res, next) => {
    const { title, date, description, userId, folderId, caseId } = req.body;
    try {
      const originalFile = req.file;
      const originalBuffer = originalFile?.buffer;

      if (!originalBuffer) {
        res.status(400).send('No file uploaded.');
        return;
      }

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `users/${userId}/${caseId}/${folderId}/${originalFile?.originalname}`,
        Body: originalBuffer,
      };

      const s3Client = getS3Config();

      const result = await s3Client.send(new PutObjectCommand(params));

      if (result['$metadata'].httpStatusCode !== 200) {
        res.status(500).send('Error uploading the file.');
        return;
      }

      // Determine the file type based on its extension
      const extension = path.extname(originalFile.originalname).toLowerCase();

      let text;

      // Call the appropriate function based on the file type
      if (extension === '.pdf') {
        text = await handlePDF(originalBuffer);
      } else if (extension === '.docx') {
        text = await handleDOCX(originalBuffer);
      } else {
        text = await handlePlaintext(originalBuffer);
      }

      const splitter = new TokenTextSplitter({
        chunkSize: 256,
        chunkOverlap: 64,
      });

      const chunks = await splitter.createDocuments([text]);

      const contextualizedChunks = chunks.map(
        (chunk) =>
          `Title: ${title}\nDate: ${new Date(
            date,
          ).toString()}\nDescription: ${description}\nText: ${
            chunk.pageContent
          }`,
      );

      const embeddings = await createEmbeddings(contextualizedChunks.slice(0));

      if (!embeddings || !embeddings.length) {
        res.status(500).send('Error creating the embeddings.');
        return;
      }

      await insertDocumentsEntry({
        entries: embeddings.map((embedding, index) => ({
          documentChunkEmbedding: embedding.embedding,
          documentChunkOriginal: contextualizedChunks[index],
        })),
      });

      const region = await s3Client.config.region();

      const fileUrl = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`;

      insertDocumentEntry({
        name: originalFile?.originalname,
        caseId,
        folderId,
        title,
        documentDate: date,
        uploadedBy: userId,
        description,
        s3Url: fileUrl,
      });

      res.json({ fileUrl, text });
    } catch (error) {
      next(error);
    }
  },
);

filesRouter.get(
  '/documents/:userId/:caseId/:folderId/:name',
  async (req, res) => {
    const { userId, caseId, folderId, name } = req.params;

    let document;

    try {
      document = await getDocumentEntry({
        userId,
        caseId,
        folderId,
        name,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Error retrieving the document.');
    }

    res.json({ document });
  },
);

filesRouter.get('/documents/:userId/:caseId', async (req, res) => {
  const { userId, caseId } = req.params;

  let documents;

  try {
    documents = await getCaseDocuments({
      userId,
      caseId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving the document.');
  }

  res.json({ documents });
});

filesRouter.get('/download', async (req, res) => {
  const filename = req.query.filename as string;
  try {
    const response = await getS3Config().send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename,
      }),
    );
    const data = await streamToBuffer(response.Body as Readable);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error downloading the file.');
  }
});
