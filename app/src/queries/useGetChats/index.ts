import axios from 'axios';
import { useQuery } from 'react-query';

interface IUseGetChatsArgs {
  userId: string;
}

interface IUseGetChatsResponse {
  isLoading: boolean;
  error: any;
  data: any;
  refetch: () => void;
}

export const useGetChats: (args: IUseGetChatsArgs) => IUseGetChatsResponse = ({
  userId,
}) => {
  const { isLoading, error, data, refetch } = useQuery('chats', async () => {
    const chatsRes = await axios.get(`/api/chats/user/${userId}`);
    return chatsRes.data;
  });
  return { isLoading, error, data: data || { chats: [] }, refetch };
};
