import { Send } from '@mui/icons-material';
import { Box, Container, Stack, TextField, Typography } from '@mui/material';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from 'styled-components';
import { useSendPrompt } from '../../../mutations/useSendPrompt';
import { useParams } from 'react-router-dom';
import { useGetCases } from '../../../queries/useGetCases';

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
  isUser: boolean;
}

const UserMessage: FC<IUseMessageProps> = ({ message, isUser }) => {
  return (
    <Typography
      variant="body1"
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      sx={{
        textAlign: isUser ? 'right' : 'left',
        backgroundColor: isUser ? 'green' : 'blue',
        marginLeft: isUser ? '24px !important' : '0px',
        marginRight: !isUser ? '24px !important' : '0px',
        color: 'white',
        borderRadius: '12px',
        padding: '12px',
      }}
    >
      {message}
    </Typography>
  );
};

export const Partner: FC = () => {
  const { chatId, caseId } = useParams();

  const [prompt, setPrompt] = useState<string>('');
  const [previousMessages, setPreviousMessages] = useState<any[]>([]);

  const {
    isLoading: isCasesLoading,
    data: casesData,
    error: casesError,
  } = useGetCases({ userId: '6483e65fd24b426cd772ce1c' });

  const { sendPrompt } = useSendPrompt({
    prompt,
    previousMessages,
    chatId,
    caseId,
  });

  const handlePartnerQuestionChange = useCallback((event: any) => {
    setPrompt(event.target.value);
  }, []);

  const handleSubmitPrompt = useCallback(async () => {
    const newUserMessage = {
      content: prompt,
      isUser: true,
    };
    setPreviousMessages((previousMessages) => [
      ...previousMessages,
      newUserMessage,
    ]);
    setPrompt('');
    const response = await sendPrompt();
    setPreviousMessages((prevMessages) => [
      ...prevMessages,
      { content: response },
    ]);
  }, [prompt, sendPrompt]);

  const relevantCase = useMemo(() => {
    return casesData?.cases.find((_case: any) => _case._id === caseId);
  }, [casesData, caseId]);

  const relevantChat = useMemo(() => {
    return relevantCase?.chats.find((chat: any) => chat._id === chatId);
  }, [relevantCase, chatId]);

  useEffect(() => {
    setPreviousMessages(
      relevantCase?.chats.find((chat: any) => chat._id == chatId)?.messages ||
        [],
    );
  }, [chatId, relevantCase, relevantCase?.chats.messages]);

  return (
    <Container
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      maxWidth="sm"
    >
      <Typography alignContent={'center'} variant="h5">
        {relevantChat
          ? `${relevantCase?.name} - ${relevantChat?.name}`
          : `${relevantCase?.name} - New Chat`}
      </Typography>
      <Stack sx={{ flex: 1 }} justifyContent={'flex-end'} spacing={2}>
        <Stack sx={{ flex: 1 }} justifyContent={'flex-end'} spacing={2}>
          {previousMessages.map((message, index) => {
            return (
              <UserMessage
                key={index}
                message={message.content}
                isUser={message.isUser}
              />
            );
          })}
        </Stack>
        <TextField
          value={prompt}
          onChange={handlePartnerQuestionChange}
          placeholder="Ask your partner a question..."
          InputProps={{
            endAdornment: <SendButton onClick={handleSubmitPrompt} />,
          }}
          sx={{ '& .MuiInputBase-root': { paddingRight: '0px' } }}
        />
      </Stack>
    </Container>
  );
};
