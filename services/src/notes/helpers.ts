import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongoInit';

interface CreateNewArgs {
  caseId: string;
  folderId: string;
  userId: string;
  content: string;
  name: string;
}

export const createNote = async ({
  caseId,
  folderId,
  userId,
  content,
  name,
}: CreateNewArgs) => {
  const mongoDB = await getDb();

  const { acknowledged, insertedId } = await mongoDB
    .collection('notes')
    .insertOne({
      userId: new ObjectId(userId),
      caseId: new ObjectId(caseId),
      folderId: new ObjectId(folderId),
      content: content || '',
      name,
    });

  await mongoDB.collection('cases').updateOne(
    { _id: new ObjectId(caseId) },
    {
      $push: {
        notes: insertedId,
      },
    },
  );

  return { acknowledged, insertedId };
};

interface UpdateNoteArgs {
  noteId: string;
}

interface UpdateNoteRes {
  acknowledged: boolean;
}

export const updateNote = async ({
  noteId,
  ...rest
}: any): Promise<UpdateNoteRes> => {
  const mongoDB = await getDb();

  console.log({ noteId });

  const { acknowledged } = await mongoDB.collection('notes').updateOne(
    { _id: new ObjectId(noteId) },
    {
      $set: {
        ...rest,
      },
    },
  );

  return { acknowledged };
};

interface GetNoteArgs {
  noteId: string;
}

export const getNote = async ({ noteId }: GetNoteArgs) => {
  const mongoDB = await getDb();

  const note = await mongoDB
    .collection('notes')
    .findOne({ _id: new ObjectId(noteId) });

  return note;
};

interface GetUserNotesArgs {
  userId: string;
}

export const getUserNotes = async ({ userId }: GetUserNotesArgs) => {
  const mongoDB = await getDb();

  const note = await mongoDB
    .collection('notes')
    .find({ userId: new ObjectId(userId) })
    .toArray();

  return note;
};
