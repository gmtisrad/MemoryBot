import axios from 'axios';
import { useQuery } from 'react-query';

interface UseGetNoteArgs {
  noteId?: string;
}

export const useGetNote = ({ noteId }: UseGetNoteArgs) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: `note-${noteId}`,
    queryFn: async () => {
      const noteRes = await axios.get(`/api/notes/${noteId}`);
      return noteRes.data;
    },
    enabled: !!noteId,
  });

  return { isLoading, error, data, refetch };
};
