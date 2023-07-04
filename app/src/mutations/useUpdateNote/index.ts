import axios, { AxiosResponse } from 'axios';
import { UseMutationResult, useMutation } from 'react-query';

interface UpdateNoteMutationArgs {
  _id: string;
  content: string;
}

export const useUpdateNote = (): UseMutationResult<
  AxiosResponse<any, any>,
  unknown,
  UpdateNoteMutationArgs,
  unknown
> => {
  const mutation = useMutation({
    mutationFn: ({ _id, content }: UpdateNoteMutationArgs) => {
      return axios.post('/api/notes/update', {
        _id,
        content,
      });
    },
  });

  return mutation;
};
