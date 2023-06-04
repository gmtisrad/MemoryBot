import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const address = `${process.env['milvus-url']}:${process.env['milvus-port']}`;
// const username = 'your-milvus-username'; // optional username
// const password = 'your-milvus-password'; // optional password
const ssl = false; // secure or not

// connect to milvus
export const client = new MilvusClient({ address, ssl });

const SCHEMA_ENTRIES = [
  {
    collection_name: 'documents',
    description: 'chunks of case documents',
    fields: [
      {
        name: 'document_chunk_id',
        description: 'Document chunk ID',
        data_type: DataType.Int64,
        is_primary_key: true,
        autoId: true,
      },
      {
        name: 'content_chunk_embedding',
        description: 'Document chunk embedding',
        data_type: DataType.FloatVector,
        is_primary_key: false,
        autoId: false,
      },
      {
        name: 'content_chunk_original',
        description: 'Document chunk original',
        data_type: DataType.String,
        is_primary_key: false,
        autoId: false,
      },
    ],
  },
];

export const createSchema = async () => {
  SCHEMA_ENTRIES.forEach(async ({ collection_name, description, fields }) => {
    await client.createCollection({
      collection_name,
      description,
      fields,
    });
  });
};

export const cleanStart = async () => {
  const collections = await client.listCollections();
  const collection_names = collections?.data.map((c) => c.name);
  collection_names.forEach(async (collection_name: string) => {
    await client.dropCollection({ collection_name });
  });
  await createSchema();
};
