import { Close } from '@mui/icons-material';
import { Box, ButtonGroup, Container, IconButton, Modal } from '@mui/material';
import { FC, ReactNode } from 'react';

const containerStyles = {
  borderRadius: '10px',
  padding: '12px 24px 24px 24px',
  backgroundColor: 'var(--joy-palette-neutral-50, #F7F7F8)',
};

interface ITakeoverModalProps {
  toggleModalOpen: (isOpen?: boolean) => void;
  open: boolean;
  children: ReactNode;
}

export const TakeoverModal: FC<ITakeoverModalProps> = ({
  toggleModalOpen,
  open,
  children,
}) => {
  return (
    <Modal open={open} onClose={() => toggleModalOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '444px',
          maxWidth: '444px',
        }}
      >
        <Container sx={containerStyles} maxWidth="xs">
          <ButtonGroup
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
            fullWidth
          >
            <IconButton size="small" onClick={() => toggleModalOpen(false)}>
              <Close />
            </IconButton>
          </ButtonGroup>
          {children}
        </Container>
      </Box>
    </Modal>
  );
};
