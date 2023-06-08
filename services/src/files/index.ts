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

// A function to handle PDF files.
async function handlePDF(buffer: Buffer) {
  // Parse the PDF and convert it to text
  const data = await pdfParse(buffer);
  console.log('PDF Loaded Successfully');

  const text = data.text.replace(/\.{3,}/g, '').replace(/\n/g, ' ');
  console.log('Text Stripped Successfully');

  return text;
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
    try {
      const originalFile = req.file;
      const originalBuffer = originalFile?.buffer;

      if (!originalBuffer) {
        res.status(400).send('No file uploaded.');
        return;
      }

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `/users/gtimm/exampleCase/${originalFile?.originalname}`,
        Body: originalBuffer,
      };

      const s3Client = getS3Config();

      const result = await s3Client.send(new PutObjectCommand(params));

      if (result['$metadata'].httpStatusCode !== 200) {
        res.status(500).send('Error uploading the file.');
        return;
      }

      console.log('Uploaded to S3 Successfully');

      // Determine the file type based on its extension
      const extension = path.extname(originalFile.originalname).toLowerCase();

      let text;

      // Call the appropriate function based on the file type
      if (extension === '.pdf') {
        text = await handlePDF(originalBuffer);
      } else {
        text = await handlePlaintext(originalBuffer);
      }
      const splitter = new TokenTextSplitter({
        chunkSize: 512,
        chunkOverlap: 128,
      });
      console.log('Text Splitter Created Successfully');

      const chunks = await splitter.createDocuments([text]);
      console.log('Text Chunked Successfully');

      // console.log({ output: chunks[0].pageContent });

      const embeddings = await createEmbeddings(
        chunks.map((chunk) => chunk.pageContent).slice(0),
      );
      console.log('Embeddings Created Successfully');

      if (!embeddings || !embeddings.length) {
        res.status(500).send('Error creating the embeddings.');
        return;
      }

      // console.log({ embeddings });

      await insertDocumentsEntry({
        entries: embeddings.map((embedding, index) => ({
          documentChunkEmbedding: embedding.embedding,
          documentChunkOriginal: chunks[index].pageContent,
        })),
      });
      console.log('Documents Inserted Into Milvus Successfully');

      // console.log({
      //   output: output[0],
      //   metadata: output[0].metadata.loc.lines,
      // });

      const region = await s3Client.config.region();

      const fileUrl = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`;

      res.json({ fileUrl, result });
    } catch (error) {
      next(error);
    }
  },
);

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
