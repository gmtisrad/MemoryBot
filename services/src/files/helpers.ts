import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import mammoth from 'mammoth';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

let _s3Client: S3Client | undefined;
let _upload: multer.Multer | undefined;

export const streamToBuffer = async (
  readableStream: Readable,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    readableStream.on('data', (data: any) => {
      chunks.push(data);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
};

export const getS3Client = () => {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: 'us-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  return _s3Client;
};

export const getUpload = () => {
  if (!_upload) {
    _upload = multer({
      storage: multer.memoryStorage(),
    });
  }

  return _upload;
};

// A function to handle PDF files.
export const handlePDF = async (buffer: Buffer) => {
  // Parse the PDF and convert it to text
  const data = await pdfParse(buffer);

  const text = data.text.replace(/\.{3,}/g, '').replace(/\n/g, ' ');

  return text;
};

// A function to handle DOCX files.
export const handleDOCX = async (buffer: Buffer) => {
  // Parse the docx and convert it to text
  const text = await mammoth.extractRawText({ buffer: buffer });
  // Process the text as you like
  const processedText = text.value.replace(/\.{3,}/g, '').replace(/\n/g, ' ');

  return processedText;
};

// This will handle any utf-8 buffers
export const handlePlaintext = async (buffer: Buffer) => {
  const text = buffer
    .toString('utf-8')
    .replace(/\.{3,}/g, '')
    .replace(/\n/g, ' ');

  return text;
};

interface IUploadBufferToS3 {
  params: PutObjectCommandInput;
}

export const uploadBufferToS3 = async ({
  params,
}: IUploadBufferToS3): Promise<PutObjectCommandOutput> => {
  const s3Client = getS3Client();

  const result = await s3Client.send(new PutObjectCommand(params));

  if (result['$metadata'].httpStatusCode !== 200) {
    throw new Error('Error uploading to S3');
  }

  return result;
};

interface IDownloadBufferFromS3 {
  filename: string;
}

export const downloadBufferFromS3 = async ({
  filename,
}: IDownloadBufferFromS3): Promise<Buffer> => {
  let data: Buffer;
  try {
    const response = await getS3Client().send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename,
      }),
    );
    data = await streamToBuffer(response.Body as Readable);
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error downloading from S3: ${error.message}`);
  }

  return data;
};

interface IGetS3FileUrl {
  bucket?: string;
  key?: string;
}

export const getS3FileUrl = async ({
  bucket,
  key,
}: IGetS3FileUrl): Promise<string> => {
  if (!bucket || !key) {
    throw new Error('Bucket and key are required for getS3FileUrl');
  }

  const region = await getS3Client().config.region();

  const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return fileUrl;
};
