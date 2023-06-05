import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
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
      storage: multerS3({
        s3: getS3Config(),
        bucket: process.env.S3_BUCKET_NAME as string,
        key: function (req, file, cb) {
          cb(null, `${Date.now().toString()}-${file.originalname}`);
        },
      }),
    });
  }

  return _upload;
}

export const filesRouter = express.Router();

filesRouter.post(
  '/upload',
  (req, res, next) => {
    getUpload().single('file')(req, res, next);
  },
  (req, res) => {
    // TODO: Fix types
    res.json({ fileUrl: (req?.file as unknown as any)?.location });
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
