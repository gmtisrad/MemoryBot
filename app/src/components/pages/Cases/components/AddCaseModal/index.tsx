import { ChangeEvent, FC, useState } from 'react';
import { TakeoverModal } from '../../../../shared/TakeoverModal';
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCreateCase } from '../../../../../mutations/useCreateCase';
import { useGetCases } from '../../../../../queries/useGetCases';

interface IAddCaseModalProps {
  toggleModalOpen: (isOpen?: boolean) => void;
  open: boolean;
}

export const AddCaseModal: FC<IAddCaseModalProps> = ({
  toggleModalOpen,
  open,
}) => {
  const { refetch } = useGetCases({ userId: '649648ac4cea1cc6acc1e35e' });

  const [caseName, setCaseName] = useState<string>('');

  const { isLoading, error, createCase } = useCreateCase({
    caseName,
    userId: '649648ac4cea1cc6acc1e35e',
    refetch,
  });

  const handleCaseNameChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCaseName(e.target.value);
  };

  return (
    <TakeoverModal toggleModalOpen={toggleModalOpen} open={open}>
      <Stack spacing={2}>
        <Typography alignContent={'center'} variant="h5">
          Cases
        </Typography>
        <Tooltip
          enterNextDelay={500}
          enterDelay={500}
          title="What is your case's title?"
        >
          <TextField
            label="Case Title"
            required
            variant="outlined"
            placeholder="Case Title..."
            value={caseName}
            onChange={handleCaseNameChange}
          />
        </Tooltip>
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          disabled={!caseName}
          onClick={async () => {
            await createCase();
            toggleModalOpen(false);
          }}
        >
          {isLoading ? <CircularProgress /> : 'Upload Document'}
        </Button>
      </Stack>
    </TakeoverModal>
  );
};
