import express from 'express';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import multer from 'multer';
import { Readable } from 'stream';
import pdfParse from 'pdf-parse';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { createEmbeddings } from '../embedding';
import { insertDocumentsEntry } from '../vector_db';

let _s3Config: S3Client | undefined;
let _upload: multer.Multer | undefined;

function getS3Config() {
  if (!_s3Config) {
    _s3Config = new S3Client({
      region: 'us-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  return _s3Config;
}

function getUpload() {
  if (!_upload) {
    _upload = multer({
      storage: multer.memoryStorage(),
    });
  }

  return _upload;
}

export const filesRouter = express.Router();
import path from 'path';
import mammoth from 'mammoth';
import { getCaseDocuments, getDocumentEntry, insertDocumentEntry } from '../db';
import { getDb } from '../db/mongoInit';

// A function to handle PDF files.
async function handlePDF(buffer: Buffer) {
  // Parse the PDF and convert it to text
  const data = await pdfParse(buffer);

  const text = data.text.replace(/\.{3,}/g, '').replace(/\n/g, ' ');

  return text;
}

// A function to handle DOCX files.
async function handleDOCX(buffer: Buffer) {
  // Parse the docx and convert it to text
  const text = await mammoth.extractRawText({ buffer: buffer });
  // Process the text as you like
  const processedText = text.value.replace(/\.{3,}/g, '').replace(/\n/g, ' ');

  return processedText;
}

// This will handle any utf-8 buffers
async function handlePlaintext(buffer: Buffer) {
  const text = buffer
    .toString('utf-8')
    .replace(/\.{3,}/g, '')
    .replace(/\n/g, ' ');

  return text;
}

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
        chunkSize: 512,
        chunkOverlap: 128,
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

function streamToBuffer(readableStream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}
