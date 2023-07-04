import axios from 'axios';
import { useQuery } from 'react-query';

interface UseGetDocumentArgs {
  documentId?: string;
}

interface UseGetDocumentResponse {
  isLoading: boolean;
  error: any;
  data: any;
  refetch: () => void;
}

export const useGetDocument: (
  args: UseGetDocumentArgs,
) => UseGetDocumentResponse = ({ documentId }) => {
  const { isLoading, error, data, refetch } = useQuery('chats', async () => {
    const documentRes = await axios.get(`/api/files/documents/${documentId}`);
    return documentRes.data;
  });
  return { isLoading, error, data: data || { document: [] }, refetch };
};
