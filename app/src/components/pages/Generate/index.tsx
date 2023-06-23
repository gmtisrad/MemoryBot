import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { useGenerateDocument } from '../../../mutations/useGenerateDocument';
import { useParams } from 'react-router-dom';

// caseDetails,
// numResults,
// previousMessages,
// cityName,
// stateName,
// documentType,
// partyA,
// partyB,
// sections,

export const Generate: FC = () => {
  const { caseId } = useParams();
  const [caseDetails, setCaseDetails] = useState<string>('');
  const [numResults, setNumResults] = useState<string>('');
  const [previousMessages, setPreviousMessages] = useState<any[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [partyA, setPartyA] = useState<string>('');
  const [partyB, setPartyB] = useState<string>('');

  const { data, isLoading, error, generateDocument } = useGenerateDocument({
    userId: '6483e65fd24b426cd772ce1c',
    caseId,
    caseDetails,
    numResults,
    previousMessages,
    cityName,
    stateName,
    documentType,
    partyA,
    partyB,
  });

  return (
    <Container
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      maxWidth="sm"
    >
      <Box
        sx={{
          position: 'relative',
          border: '1px solid black',
          mb: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: `${isLoading ? 'center' : 'flex-start'}`,
          height: '714px',
          width: '552px',
          overflowY: 'auto',
        }}
      >
        {!data && !isLoading && (
          <Typography variant="h4">
            Fill in your document information
          </Typography>
        )}
        {!data && isLoading && <CircularProgress />}
        {data && !isLoading && (
          <iframe
            style={{ height: '100%', width: '100%' }}
            srcDoc={data?.response}
          />
        )}
        {/* <Box sx={{ transform: 'scale(0.6)', position: 'absolute', top: '0px' }}>
          <div dangerouslySetInnerHTML={{ __html: data?.response }} />
        </Box> */}
      </Box>
      <Stack spacing={2}>
        <TextField
          id="case-details"
          label="Case Details"
          onChange={(event) => setCaseDetails(event.target.value)}
          value={caseDetails}
        />
        <TextField
          id="num-results"
          label="Number of Results"
          onChange={(event) => setNumResults(event.target.value)}
          value={numResults}
        />
        <TextField
          id="city-name"
          label="City Name"
          onChange={(event) => setCityName(event.target.value)}
          value={cityName}
        />
        <TextField
          id="state-name"
          label="State Name"
          onChange={(event) => setStateName(event.target.value)}
          value={stateName}
        />
        <TextField
          id="document-type"
          label="Document Type"
          onChange={(event) => setDocumentType(event.target.value)}
          value={documentType}
        />
        <TextField
          id="party-a"
          label="Party A"
          onChange={(event) => setPartyA(event.target.value)}
          value={partyA}
        />
        <TextField
          id="party-b"
          label="Party B"
          onChange={(event) => setPartyB(event.target.value)}
          value={partyB}
        />
        <Button
          variant="contained"
          color={!isLoading ? 'primary' : 'secondary'}
          onClick={() => generateDocument()}
          sx={{ pt: '12px', pb: '12px' }}
        >
          {isLoading ? <CircularProgress /> : 'Generate Document'}
        </Button>
      </Stack>
    </Container>
  );
};
