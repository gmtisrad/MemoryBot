import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as RawEditor } from 'tinymce';
import { debounce } from 'lodash';
import { useUpdateNote } from '../../../mutations/useUpdateNote';
import { useGetNote } from '../../../queries/useGetNote';
import { useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

export const Notes = () => {
  const [editorObject, setEditorObject] = useState<RawEditor>();
  const { noteId } = useParams();
  const { isLoading, data: note } = useGetNote({ noteId });
  const { mutateAsync: updateNote } = useUpdateNote();

  const autosaveNote = async (content: string, editor: RawEditor) => {
    // Here you will later implement the saving of the note

    await updateNote({
      _id: noteId as string,
      content: editor.getContent(),
    });

    editor.setDirty(false);
  };

  const debouncedSave = debounce(autosaveNote, 5000);

  const handleEditorChange = (currentValue: string, editor: RawEditor) => {
    debouncedSave(currentValue, editor);
  };

  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Editor
          tinymceScriptSrc={'/public/tinymce/tinymce.min.js'}
          onInit={(evt, editor) => setEditorObject(editor)}
          initialValue={note?.content}
          onEditorChange={handleEditorChange}
          init={{
            height: '100%',
            menubar: false,
            skin: 'tinymce-5',
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'preview',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style:
              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }; border-radius: 0px; border: none;',
            content_css: 'document',
          }}
        />
      )}
    </>
  );
};
