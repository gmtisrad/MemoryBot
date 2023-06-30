import axios from 'axios';
import { useQuery } from 'react-query';

export const useGetBase64PDF = ({ documentId }: { documentId?: string }) => {
  const { isLoading, error, data, refetch } = useQuery('pdf', async () => {
    const casesRes = await axios.get(`/api/files/download/${documentId}/uri`);

    return casesRes.data;
  });

  return { isLoading, error, data, refetch };
};
