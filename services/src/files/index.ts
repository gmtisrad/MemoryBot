import express from 'express';
import {
  downloadBufferFromS3,
  getS3FileUrl,
  getUpload,
  uploadBufferToS3,
} from './helpers';
import {
  getCaseDocuments,
  getDocumentEntry,
  insertDocumentEntry,
} from '../db/helpers';
import { splitBufferByToken, splitTextByToken } from '../langchain/documents';
import { recursiveSummarizeBuffer } from '../llm/helpers';
import { embedAndStore } from '../langchain/milvus';
import { getCase } from '../cases/helpers';

export const filesRouter = express.Router();

filesRouter.post('/upload', getUpload().single('file'), async (req, res) => {
  const { title, date, userId, folderId, caseId } = req.body;
  try {
    const originalFile = req.file;
    const originalBuffer = originalFile?.buffer;

    const relevantCase = await getCase({ caseId });

    console.log({ relevantCase });

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

    const caseMetadata = {
      title,
      date,
      userId,
      folderId,
      caseId,
    };

    const caseChunkHeaders = {
      chunkHeader: `Title: ${title}\nDate: ${date}\nFileName: ${originalFile?.originalname}\nCase Name: ${relevantCase.name}`,
      chunkOverlapHeader: '\nOverlap: ...',
      appendChunkOverlapHeader: true,
    };

    const contextualizedChunks = await splitBufferByToken({
      buffer: originalBuffer,
      metadata: caseMetadata,
      fileName: originalFile?.originalname,
      chunkHeaderOptions: caseChunkHeaders,
    });

    const summarizedDocument = await recursiveSummarizeBuffer({
      buffer: originalBuffer,
      fileName: originalFile?.originalname,
    });

    const summaryChunks = await splitTextByToken({
      text: summarizedDocument,
      metadata: caseMetadata,
      chunkHeaderOptions: caseChunkHeaders,
    });

    await embedAndStore({
      collection: `case_${caseId}`,
      documents: [...contextualizedChunks, ...summaryChunks],
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
      description: summarizedDocument,
      s3Url: fileUrl,
    });

    res.json({ summarizedDocument });
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
