import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Readable } from 'stream';
import { TokenTextSplitter } from 'langchain/text_splitter';
import fs from 'fs';

let _upload: multer.Multer | undefined;

function getUpload() {
  if (!_upload) {
    _upload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '/tmp/my-uploads');
        },
        filename: function (req, file, cb) {
          cb(null, file.fieldname + '-' + Date.now());
        },
      }),
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
      // req.file is the file object. path contains the path of the uploaded file
      const originalFile = req.file;

      // Here, perform operations on the originalFile

      // Once done, read the local file
      const fileContent = fs.readFileSync(originalFile.path);

      // Configure S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${Date.now().toString()}-${originalFile.originalname}`,
        Body: fileContent,
      };

      // Upload the file to S3
      const s3Client = getS3Config();
      const result = await s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${params.Bucket}.s3.${s3Client.config.region}.amazonaws.com/${params.Key}`;

      // delete the file after upload
      fs.unlinkSync(originalFile.path);

      // Respond with URL
      res.json({ fileUrl });
    } catch (error) {
      next(error);
    }
  },
);

filesRouter.post(
  '/upload',
  async (req, res, next) => {
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
