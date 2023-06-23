import express from 'express';
import {
  downloadBufferFromS3,
  getS3FileUrl,
  getUpload,
  uploadBufferToS3,
} from './helpers';
import { insertVectorDocumentsEntry } from '../vector_db/helpers';
import {
  getCaseDocuments,
  getDocumentEntry,
  insertDocumentEntry,
} from '../db/helpers';
import { splitBufferByToken } from '../langchain/documents';
import { Embeddings } from '../langchain/embeddings';

export const filesRouter = express.Router();

filesRouter.post('/upload', getUpload().single('file'), async (req, res) => {
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
      Key: `users/${userId}/case/${caseId}/folder/${folderId}/${originalFile.filename}`,
      Body: originalBuffer,
    };

    await uploadBufferToS3({ params });

    const contextualizedChunks = await splitBufferByToken({
      buffer: originalBuffer,
      metadata: {
        title,
        date,
        description,
        userId,
        folderId,
        caseId,
      },
      fileName: originalFile?.originalname,
      chunkHeaderOptions: {
        chunkHeader: `Title: ${title}\nDate: ${date}\nDescription: ${description}\nFileName: ${originalFile?.originalname}`,
        chunkOverlapHeader: 'Overlap: ...',
        appendChunkOverlapHeader: true,
      },
    });

    const embeddedChunks: number[][] = await Embeddings.embedDocuments({
      documents: contextualizedChunks,
    });

    await insertVectorDocumentsEntry({
      entries: embeddedChunks.map((embeddedChunk, index) => ({
        documentChunkEmbedding: embeddedChunk,
        documentChunkOriginal: contextualizedChunks[index].pageContent,
      })),
    });

    const fileUrl = await getS3FileUrl({
      bucket: params.Bucket,
      key: params.Key,
    });

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

    res.json({ fileUrl, contextualizedChunks, embeddedChunks });
  } catch (error: any) {
    res.status(500).send(`Error uploading file: ${error.message}`);
  }
});

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
    const data = await downloadBufferFromS3({ filename });

    res.send(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(`Error downloading the file: ${error.message}`);
  }
});
