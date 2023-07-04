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
  const { userId, folderId, caseId } = req.body;
  try {
    const originalFile = req.file;
    const originalBuffer = originalFile?.buffer;

    const relevantCase = await getCase({ caseId });

    if (!originalBuffer) {
      res.status(400).send('No file uploaded.');
      return;
    }

    const Key = `users/${userId}/case/${caseId}/folder/${folderId}/${originalFile.originalname}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key,
      Body: originalBuffer,
    };

    await uploadBufferToS3({ params });

    const date = new Date().toISOString();

    const caseMetadata = {
      title: originalFile.originalname,
      date,
      userId,
      folderId,
      caseId,
    };

    const caseChunkHeaders = {
      chunkHeader: `Title: ${originalFile.originalname}\nFileName: ${originalFile?.originalname}\nCase Name: ${relevantCase.name}\n`,
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
      title: originalFile.originalname,
      documentDate: date,
      uploadedBy: userId,
      description: summarizedDocument,
      s3Url: fileUrl,
      key: Key,
    });

    res.json({ summarizedDocument });
  } catch (error: any) {
    res.status(500).send(`Error uploading file: ${error.message}`);
  }
});

filesRouter.get('/documents/:documentId', async (req, res) => {
  const { documentId } = req.params;

  let document;

  try {
    document = await getDocumentEntry({ documentId });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving the document.');
  }

  res.json({ document });
});

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

filesRouter.get('/download/:documentId/uri', async (req, res) => {
  const { documentId }: { documentId: string } = req.params;

  const document = await getDocumentEntry({ documentId });

  if (!document) {
    res.status(404).send('Document not found.');
    return;
  }

  const { key } = document;

  try {
    const data = await downloadBufferFromS3({ key });

    // Convert the buffer to a base64 string
    const base64Data = Buffer.from(data).toString('base64');

    // Create the data URI string
    // const dataURI = base64Data;
    const dataURI = `data:application/pdf;base64,${base64Data}`;

    res.send({ url: dataURI });
  } catch (error: any) {
    console.error(error);
    res.status(500).send(`Error downloading the file: ${error.message}`);
  }
});
