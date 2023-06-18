import { useState } from 'react';

interface IPromptOpenAiGenerateDocumentArgs {
  caseId?: string;
  userId: string;
  caseDetails: string;
  numResults: string;
  previousMessages: string[];
  cityName: string;
  stateName: string;
  documentType: string;
  partyA: string;
  partyB: string;
  sections?: string[];
}

interface IPromptOpenAiGenerateDocumentResponse {
  data: any;
  error: any;
  isLoading: boolean;
  generateDocument: () => void;
}

export const useGenerateDocument: ({
  caseDetails,
  numResults,
  previousMessages,
  cityName,
  stateName,
  documentType,
  partyA,
  partyB,
  sections,
}: IPromptOpenAiGenerateDocumentArgs) => IPromptOpenAiGenerateDocumentResponse = ({
  caseId,
  userId,
  caseDetails,
  numResults,
  previousMessages,
  cityName,
  stateName,
  documentType,
  partyA,
  partyB,
  sections,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const generateDocument = async () => {
    setIsLoading(true);
    let _response;
    try {
      _response = await fetch('/api/partner/generateDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          userId,
          caseDetails,
          numResults,
          previousMessages,
          cityName,
          stateName,
          documentType,
          partyA,
          partyB,
          sections,
        }),
      });
      const data = await _response.json();
      setData(data);
      return data.response;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, generateDocument };
};
