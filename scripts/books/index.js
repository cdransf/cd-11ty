import fs from 'fs'
import fetch from 'node-fetch'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../.env.local', import.meta.url).pathname });

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY
  },
  endpoint: {
    url: 'https://s3.us-west-001.backblazeb2.com',
  },
  region: 'us-west-1',
});
const booksData = fs.readFileSync('../../src/_data/json/read.json', 'utf8');
const books = JSON.parse(booksData);

async function processBooks() {
  for (const book of books) {
    if (book.thumbnail.startsWith('https://coryd.dev/media/books/')) continue
    const cleanedThumbnailURL = book.thumbnail.replace('&edge=curl', '');
    const fileName = `${book.isbn}-${book.title.replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-{2,}/g, '-').replace(/^-+|-+$/g, '') .toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const fileKey = `books/${fileName}`

    try {
      const response = await fetch(cleanedThumbnailURL);
      const buffer = await response.buffer();
      const putObjectParams = {
        Bucket: process.env.B2_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: 'image/jpeg'
      };

      await s3Client.send(new PutObjectCommand(putObjectParams));

      book.thumbnail = `https://coryd.dev/media/books/${fileName}`;

      console.log(`Uploaded and updated ${book.title}`);
    } catch (error) {
      console.error(`Failed to process ${book.title}: ${error}`);
    }
  }

  fs.writeFileSync('../../src/_data/json/read.json', JSON.stringify(books, null, 2));
}

processBooks();