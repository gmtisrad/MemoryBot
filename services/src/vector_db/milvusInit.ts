import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

let milvusClient: MilvusClient | undefined;

export const getMilvusClient = () => {
  if (!milvusClient) {
    const address = `${process.env.MILVUS_URL}:${process.env.MILVUS_PORT}`;
    // const username = 'your-milvus-username'; // optional username
    // const password = 'your-milvus-password'; // optional password
    const ssl = false; // secure or not

    milvusClient = new MilvusClient({
      address,
      ssl,
    });
  }

  return milvusClient;
};

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
        autoID: true,
      },
      {
        name: 'document_chunk_embedding',
        description: 'Document chunk embedding',
        data_type: DataType.FloatVector,
        is_primary_key: false,
        autoID: false,
        type_params: {
          dim: 1536, // The number of dimensions of the ada-2 embedding model
        },
      },
      {
        name: 'document_chunk_original',
        description: 'Document chunk original',
        data_type: DataType.VarChar,
        is_primary_key: false,
        autoID: false,
        max_length: 1024,
      },
    ],
  },
];

export const createSchema = async () => {
  const client = getMilvusClient();

  await Promise.all(
    SCHEMA_ENTRIES.map(async ({ collection_name, description, fields }) => {
      const { error_code, reason } = await client.createCollection({
        collection_name,
        description,
        fields,
      });

      if (error_code !== 'Success') {
        throw new Error(
          `Failed to create collection ${collection_name} - ${error_code} - ${reason}`,
        );
      }

      // console.log({ error_code, reason });

      return { error_code, reason };
    }),
  );

  const index_params = {
    metric_type: 'L2',
    index_type: 'IVF_FLAT',
    params: JSON.stringify({ nlist: 1 }),
  };

  const createdIndex = await client.createIndex({
    collection_name: 'documents',
    field_name: 'document_chunk_embedding',
    extra_params: index_params,
  });

  // console.log({ createdIndex });

  const collections = await client.listCollections();

  return collections;
};

export const cleanStart = async () => {
  const client = getMilvusClient();

  const collections = await client.listCollections();

  // console.log({ collections });

  const collection_names = collections?.data.map((c) => c.name);

  await Promise.all(
    collection_names.map(async (collection_name: string) => {
      // console.log({ collection_name });
      await client.dropCollection({ collection_name });
    }),
  );

  await createSchema();
};
