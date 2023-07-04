import express from 'express';
import { createNote, getNote, getUserNotes, updateNote } from './helpers';

export const notesRouter = express.Router();

const getCurrentDate = () => {
  const date = new Date();

  // getMonth() returns a 0-indexed month, so we add 1
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

notesRouter.post('/create', async (req, res) => {
  const { caseId, folderId, userId, content } = req.body;

  let createNoteRes;

  try {
    createNoteRes = await createNote({
      caseId,
      folderId,
      userId,
      content,
      name: `Note - ${getCurrentDate()}`,
    });
  } catch (e) {
    res.status(500).send('Failed to create new note.');
  }

  res.json(createNoteRes);
});

notesRouter.post('/update', async (req, res) => {
  const { _id, ...rest } = req.body;
  console.log({ _id, ...rest });

  let updateNoteRes;

  try {
    updateNoteRes = await updateNote({
      noteId: _id,
      ...rest,
    });
  } catch (e) {
    res?.status(500).send('Failed to update note.');
  }

  res?.json({ updateNoteRes, updatedId: _id });
});

notesRouter.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  let fetchedNotes;

  try {
    fetchedNotes = await getUserNotes({
      userId,
    });
  } catch (e) {
    res?.status(500).send('Failed to update note.');
  }

  res?.json(fetchedNotes);
});

notesRouter.get('/:noteId', async (req, res) => {
  const { noteId } = req.params;

  let fetchedNote;

  try {
    fetchedNote = await getNote({
      noteId,
    });
  } catch (e) {
    res?.status(500).send('Failed to update note.');
  }

  res?.json(fetchedNote);
});
