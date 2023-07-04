import axios from 'axios';
import { useMemo } from 'react';
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
  const memoizedDocumentId = useMemo(() => documentId, [documentId]);
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: 'chats',
    queryFn: async () => {
      const documentRes = await axios.get(
        `/api/files/documents/${memoizedDocumentId}`,
      );
      return documentRes.data;
    },
    refetchInterval: Infinity,
    refetchOnWindowFocus: false,
  });
  return { isLoading, error, data: data || { document: [] }, refetch };
};
