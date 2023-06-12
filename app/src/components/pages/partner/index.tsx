import { Send } from '@mui/icons-material';
import { Box, Container, Stack, TextField, Typography } from '@mui/material';
import { FC, useCallback, useState } from 'react';
import { styled } from 'styled-components';

const StyledSend = styled(Send)`
  cursor: pointer;
  height: '100%';
  padding-right: '12px';
`;

const sendButtonStyles = {
  height: '100%',
  pl: '12px',
  paddingRight: '12px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#D7F5DD',
  '&:hover': {
    backgroundColor: '#77EC95',
  },
};

interface ISendButtonProps {
  onClick: () => void;
}

const SendButton: FC<ISendButtonProps> = ({ onClick }) => {
  return (
    <Box sx={sendButtonStyles} onClick={onClick}>
      <StyledSend />
    </Box>
  );
};

interface IUseMessageProps {
  message: string;
}

const UserMessage: FC<IUseMessageProps> = ({ message }) => {
  return (
    <Typography variant="body1" sx={{ textAlign: 'right' }}>
      {message}
    </Typography>
  );
};

export const Partner: FC = () => {
  const [partnerQuestion, setPartnerQuestion] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);

  const handlePartnerQuestionChange = useCallback((event: any) => {
    setPartnerQuestion(event.target.value);
  }, []);

  return (
    <Container
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      maxWidth="sm"
    >
      <Typography alignContent={'center'} variant="h5">
        Partner
      </Typography>
      <Stack sx={{ flex: 1 }} justifyContent={'flex-end'} spacing={2}>
        <Stack sx={{ flex: 1 }} justifyContent={'flex-end'} spacing={2}></Stack>
        <TextField
          value={partnerQuestion}
          onChange={handlePartnerQuestionChange}
          placeholder="Ask your partner a question..."
          InputProps={{ endAdornment: <SendButton onClick={() => {}} /> }}
          sx={{ '& .MuiInputBase-root': { paddingRight: '0px' } }}
        />
      </Stack>
    </Container>
  );
};
