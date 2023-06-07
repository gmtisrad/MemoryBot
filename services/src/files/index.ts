import express from 'express';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import multer from 'multer';
import { Readable } from 'stream';

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

filesRouter.post(
  '/upload',
  getUpload().single('file'),
  async (req, res, next) => {
    try {
      // req.file is the file object. buffer contains the file data
      const originalFile = req.file;
      const originalBuffer = originalFile?.buffer;

      const stringifiedFile = originalBuffer?.toString('utf-8');

      console.log({ originalFile });

      // Here, perform operations on the originalBuffer
      // Example: const processedBuffer = performOperation(originalBuffer);

      // Once done, prepare the file for S3 upload
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${originalFile?.originalname}`,
        Body: originalBuffer, // Replace this with processedBuffer if you made changes to the buffer
      };

      // Upload the file to S3
      const s3Client = getS3Config();
      await s3Client.send(new PutObjectCommand(params));

      const fileUrl = `https://${params.Bucket}.s3.${s3Client.config.region}.amazonaws.com/${params.Key}`;

      // Respond with URL
      res.json({ fileUrl });
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

// Helper function to convert a stream to a buffer
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
