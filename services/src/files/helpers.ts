import { S3Client } from '@aws-sdk/client-s3';
import mammoth from 'mammoth';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

let _s3Config: S3Client | undefined;
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

export const getS3Config = () => {
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
