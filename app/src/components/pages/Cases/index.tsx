import { FC, useState } from 'react';
import { Button, Container, Stack } from '@mui/material';
import { AddDocumentModal } from './components/AddDocumentModal';
import { AddFolderModal } from './components/AddFolderModal';
import { AddCaseModal } from './components/AddCaseModal';

export const Cases: FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);

  const toggleAddCaseModalOpen = (isOpen?: boolean) => {
    setIsAddCaseModalOpen(isOpen || !isAddCaseModalOpen);
  };

  const toggleModalOpen = (isOpen?: boolean) => {
    setIsAddModalOpen(isOpen || !isAddModalOpen);
  };

  const toggleFolderModalOpen = (isOpen?: boolean) => {
    setIsAddFolderModalOpen(isOpen || !isAddFolderModalOpen);
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={2}>
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          onClick={() => toggleAddCaseModalOpen(true)}
        >
          Add Case
        </Button>
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          onClick={() => toggleFolderModalOpen(true)}
        >
          Add Folder
        </Button>
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          onClick={() => toggleModalOpen(true)}
        >
          Add Document
        </Button>
      </Stack>
      <AddCaseModal
        toggleModalOpen={toggleAddCaseModalOpen}
        open={isAddCaseModalOpen}
      />
      <AddFolderModal
        toggleModalOpen={toggleFolderModalOpen}
        open={isAddFolderModalOpen}
      />
      <AddDocumentModal
        toggleModalOpen={toggleModalOpen}
        open={isAddModalOpen}
      />
    </Container>
  );
};
