import { MongoClient, Db } from 'mongodb';

let _client: MongoClient | undefined;
let _db: Db | undefined;

export const getClient = async () => {
  if (!_client) {
    const url = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;
    _client = new MongoClient(url);
    await _client.connect();
  }

  return _client;
};

export const getDb = async () => {
  if (!_db) {
    const client = await getClient();
    _db = client.db(process.env.MONGODB_DB_NAME);
  }

  return _db;
};

const COLLECTIONS = ['documents'];

export const createCollections = async () => {
  const db = await getDb();

  // Creating documents collection
  for (const collection of COLLECTIONS) {
    await db.createCollection(collection);
  }
};

export const cleanStart = async () => {
  const db = await getDb();
  const collections = await db.collections();

  await Promise.all(
    collections.map(async (collection) => {
      await collection.drop();
    }),
  );

  await createCollections();
};
