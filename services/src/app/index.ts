import express from 'express';
import { createEmbedding } from '../embedding';
import { similaritySearch } from '../vector_db';
import { createCompletion } from '../completion';
import {
  createCase,
  createCaseFolder,
  getCase,
  getUserCases,
  structureFolders,
} from '../db';
import { getDb } from '../db/mongoInit';
import { IMessage, createChat, insertMessages } from '../chats';
import { ObjectId } from 'mongodb';

export const appRouter = express.Router();

appRouter.post('/searchEmbedding', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  res.json({ embeddingSearchResponse });
});

appRouter.get('/getCaseDocuments', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  res.json({ embeddingSearchResponse });
});

appRouter.post('/promptRequest', async (req, res) => {
  const { prompt, numResults } = req.body;

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    res.status(400).send('Embedding could not be created');
    return;
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults,
  });

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );

  const promptWithContext = `${similarChunks.join(
    '\r\n\n',
  )}\r\n\nPrompt: ${prompt}`;

  const completion = await createCompletion(promptWithContext);

  res.json({ completion });
});

appRouter.post('/cases/create', async (req, res) => {
  const { caseName, userId } = req.body;

  let createCaseRes;

  try {
    createCaseRes = await createCase({ caseName, userId });
  } catch (e) {
    console.log(e);
  }

  res.json({ caseName, createCaseRes, status: 'success' });
});

appRouter.post('/cases/folder/create', async (req, res) => {
  const { caseId, folderName, parent } = req.body;

  let createCaseFolderRes;

  try {
    createCaseFolderRes = await createCaseFolder({
      caseId,
      folderName,
      parent: parent || null,
    });
  } catch (e) {
    console.log(e);
  }

  res.json({ caseId, createCaseFolderRes, status: 'success' });
});

appRouter.get('/cases/user/:userId', async (req, res) => {
  const mongoDB = await getDb();

  const { userId } = req.params;

  let cases: any[];
  let casesWithFolders: any[];

  try {
    cases = await getUserCases({ userId });

    casesWithFolders = await Promise.all(
      cases.map(async (caseItem) => {
        const foldersRes = await mongoDB
          .collection('folders')
          .find({ _id: { $in: caseItem.folders } })
          .toArray();

        const documentsRes = await mongoDB
          .collection('documents')
          .find({ _id: { $in: caseItem.documents } })
          .toArray();

        const chatsRes = await mongoDB
          .collection('chats')
          .find({ caseId: caseItem._id })
          .toArray();

        const generatedDocuments = await mongoDB
          .collection('generatedDocuments')
          .find({ caseId: caseItem._id })
          .toArray();

        const structuredFolders = structureFolders({
          folders: foldersRes,
          documents: documentsRes,
        });

        return {
          ...caseItem,
          folders: structuredFolders,
          documents: documentsRes.filter((doc: any) => !doc.folderId) || [],
          chats: chatsRes || [],
          generatedDocuments,
        };
      }),
    );
  } catch (e) {
    console.log(e);
    res.status(500).send('Error getting cases');
    return;
  }

  res.json({ cases: casesWithFolders });
});

appRouter.get('/cases/:caseId', async (req, res) => {
  const { caseId } = req.params;

  let _case;

  try {
    _case = await getCase({ caseId });
  } catch (e) {
    console.log(e);
    res.status(500).send('Error getting case');
  }

  res.json({ _case });
});

// appRouter.post('/partner/prompt', async (req, res) => {
//   const { prompt, numResults, previousMessages } = req.body;

//   const promptEmbedding = await createEmbedding(prompt);

//   if (!promptEmbedding) {
//     res.status(400).send('Embedding could not be created');
//     return;
//   }

//   const embeddingSearchResponse = await similaritySearch({
//     promptEmbedding: promptEmbedding.embedding,
//     numResults: numResults || 5,
//   });

//   const similarChunks = embeddingSearchResponse?.map(
//     (result: any) => result.document_chunk_original,
//   );

//   const promptWithContext = `${similarChunks.join(
//     '\r\n',
//   )}\r\n----\r\n${previousMessages.join('\r\n')}\r\nPrompt: ${prompt}`;

//   const completion = await createCompletion(promptWithContext);

//   res.json({
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     response: completion.choices[0].message.content,
//     promptWithContext,
//     similarChunks,
//   });
// });

appRouter.post('/partner/chats/create', async (req, res) => {
  const { userId, caseId, name } = req.body;

  await createChat({
    userId: new ObjectId(userId),
    caseId: new ObjectId(caseId),
    name,
  });

  res.json({ status: 'success' });
});

appRouter.get('/partner/chats/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const mongoDB = await getDb();

  const chats = await mongoDB
    .collection('chats')
    .find({ userId: new ObjectId(userId) })
    .toArray();

  const chatsByCase = chats.reduce((acc: any, chat: any) => {
    if (!acc[chat.caseId]) {
      acc[chat.caseId] = [];
    }

    acc[chat.caseId].push(chat);

    return acc;
  }, {});

  res.json({ chats: chatsByCase });
});

interface IPromptOpenAiArgs {
  prompt: string;
  numResults: string;
  previousMessages: string[];
  userId: string;
  caseId: string;
  chatId?: string;
}

const promptOpenAI = async ({
  prompt,
  numResults,
  previousMessages,
  userId,
  caseId,
  chatId,
}: IPromptOpenAiArgs): Promise<{ response: string }> => {
  let createdChatId = new ObjectId(chatId);

  if (!chatId) {
    const createChatRes = await createChat({
      userId: new ObjectId(userId),
      caseId: new ObjectId(caseId),
      name: 'Chat',
    });

    createdChatId = createChatRes.chatId;
  }

  const promptEmbedding = await createEmbedding(prompt);

  if (!promptEmbedding) {
    throw new Error('Embedding could not be created');
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults: numResults || '10',
  });

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );

  const promptWithContext = `${similarChunks.join(
    '\r\n',
  )}\r\n----\r\n${previousMessages.join('\r\n')}\r\nPrompt: ${prompt}`;

  const completion = await createCompletion(promptWithContext);

  if (completion.status === 500) {
    throw new Error('Error creating completion');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const response = completion.choices[0].message.content;

  const newMessage: IMessage = {
    id: new ObjectId(),
    isUser: true,
    content: prompt,
  };

  const responseMessage: IMessage = {
    id: new ObjectId(),
    isUser: false,
    content: response,
  };

  insertMessages({
    chatId: new ObjectId(createdChatId),
    messages: [newMessage, responseMessage],
  });

  return {
    response: completion.choices[0].message.content,
  };
};

interface ICreateGeneratedDocumentArgs {
  userId: ObjectId;
  caseId: ObjectId;
  generatedContent: string;
  caseDetails: string;
  cityName: string;
  stateName: string;
  documentType: string;
  partyA: string;
  partyB: string;
  sections?: string[];
}

interface ICreateGeneratedDocumentRes {
  acknowledged: boolean;
  insertedId: ObjectId;
}

const createGeneratedDocument = async ({
  userId,
  caseId,
  generatedContent,
  caseDetails,
  cityName,
  stateName,
  documentType,
  partyA,
  partyB,
  sections,
}: ICreateGeneratedDocumentArgs): Promise<ICreateGeneratedDocumentRes> => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('generatedDocuments')
    .insertOne({
      userId,
      caseId,
      generatedContent,
      caseDetails,
      cityName,
      stateName,
      documentType,
      partyA,
      partyB,
      sections,
    });

  await mongoDB.collection('cases').updateOne(
    {
      _id: caseId,
    },
    {
      $push: {
        generatedDocuments: insertedId,
      },
    },
  );

  return { acknowledged, insertedId };
};

interface IPromptOpenAiGenerateDocumentArgs {
  caseDetails: string;
  numResults: string;
  previousMessages: string[];
  cityName: string;
  stateName: string;
  documentType: string;
  partyA: string;
  partyB: string;
  sections?: string[];
}

const promptOpenAIGenerateDocument = async ({
  caseDetails,
  numResults,
  previousMessages,
  cityName,
  stateName,
  documentType,
  partyA,
  partyB,
  sections,
}: IPromptOpenAiGenerateDocumentArgs): Promise<{ response: string }> => {
  // const DOCUMENT_GENERATOR_PROMPT_PREFIX =
  //   'System prompt: You are a HTML and CSS generator who specializes in creating documents for lawyers. You will be given a prompt describing the document to be generated.  You must generate documents in 8.5" width and use HTML and inline CSS, and you MUST NOT send anything other than the HTML and CSS. If the user provides a city or county in which the document should be filed, please structure the document for filing in that jurisdiction.';

  const DOCUMENT_GENERATOR_SYSTEM_PROMPT = `{GPT-4: Generate a legal document in HTML and CSS. The document should be designed for legal filings in the city of ${cityName} and the state of ${stateName}. It should adhere to the standard paper width of 8.5" wide for easy conversion to PDF, meaning the html document should have a width of '8.5in', not a max-width, but a style value of 'width: 8.5'. The legal document required is a ${documentType}, involving the case between ${partyA} (plaintiff) and ${partyB} (defendant). ${
    sections
      ? `Please ensure the generated document includes sections for ${sections.join(
          ' and ',
        )}.`
      : ''
  }. Ensure it's appropriately formatted according to legal standards. The document should be centered horizontally, no exceptions on this condition`;

  // const generateDocumentPrompt = `${DOCUMENT_GENERATOR_PROMPT_PREFIX}\r\n\nPrompt: ${prompt}`;

  const generateDocumentPrompt = `${DOCUMENT_GENERATOR_SYSTEM_PROMPT}\r\n\nCase Details: ${caseDetails}`;

  const promptEmbedding = await createEmbedding(
    `Case Details: ${caseDetails} City Name: ${cityName} State Name: ${stateName} Document Type: ${documentType} Party A: ${partyA} Party B: ${partyB}`,
  );

  if (!promptEmbedding) {
    throw new Error('Embedding could not be created');
  }

  const embeddingSearchResponse = await similaritySearch({
    promptEmbedding: promptEmbedding.embedding,
    numResults: numResults || '10',
  });

  const similarChunks = embeddingSearchResponse?.map(
    (result: any) => result.document_chunk_original,
  );

  const promptWithContext = `${similarChunks.join(
    '\r\n',
  )}\r\n----\r\n${previousMessages.join('\r\n')}\r\n${generateDocumentPrompt}`;

  const completion = await createCompletion(promptWithContext);

  if (completion.status === 500) {
    throw new Error('Error creating completion');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const response = completion.choices[0].message.content;

  return {
    response,
  };
};

appRouter.post('/partner/generateDocument', async (req, res) => {
  const {
    caseId,
    userId,
    caseDetails,
    numResults,
    previousMessages,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
    sections,
  } = req.body;

  const { response } = await promptOpenAIGenerateDocument({
    caseDetails,
    numResults,
    previousMessages,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
    sections,
  });

  await createGeneratedDocument({
    userId: new ObjectId(userId),
    caseId: new ObjectId(caseId),
    generatedContent: response,
    caseDetails,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
    sections,
  });

  res.json({ response });
});

appRouter.get(
  '/partner/:caseId/generated/:generatedDocumentId',
  async (req, res) => {
    const { caseId, generatedDocumentId } = req.params;

    const mongoDB = await getDb();

    const generatedDocument = await mongoDB
      .collection('generatedDocuments')
      .findOne({
        _id: new ObjectId(generatedDocumentId),
        caseId: new ObjectId(caseId),
      });

    res.json({ generatedDocument });
  },
);

appRouter.get('/partner/:caseId/generated', async (req, res) => {
  const { caseId } = req.params;

  const mongoDB = await getDb();

  const generatedDocuments = await mongoDB
    .collection('generatedDocuments')
    .find({
      caseId: new ObjectId(caseId),
    })
    .toArray();

  res.json({ generatedDocuments });
});

appRouter.post('/partner/prompt', async (req, res) => {
  const { prompt, numResults, previousMessages, userId, caseId, chatId } =
    req.body;

  const { response } = await promptOpenAI({
    prompt,
    numResults,
    previousMessages,
    userId,
    caseId,
    chatId,
  });

  res.json({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    response,
  });
});
